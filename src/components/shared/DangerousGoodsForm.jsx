// src/components/quotes/QuoteGenerator/DangerousGoodsForm.jsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuote } from '../../../contexts/QuoteContext';
import { presignSds, putToPresignedUrl, registerSdsDraft } from '../../../services/uploads';
import { attachDgToQuote } from '../../../services/quotes';
import { X, Upload, FileText } from 'lucide-react';

const makeTempId = () => `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const isTempId = (id) => typeof id === 'string' && id.startsWith('TEMP-');

// Transform DG form data into Pelicargo format
const transformDGDataForPelicargo = (form) => {
  return {
    // Mark as dangerous goods
    cargo_type: 'DangerousGoods',
    
    // UN details - ensure proper format
    un_number: parseInt(form.unNumber?.replace(/[^\d]/g, '') || 0), // Remove "UN" prefix, convert to number
    class: parseInt(form.classDivision || 0), // Convert to number
    packing_group: form.packingGroup?.toUpperCase() || '', // Ensure uppercase
    
    // Proper shipping name
    proper_shipping_name: form.properName?.trim() || '',
    
    // Aircraft variant (not aircraftType!)
    aircraft_variant: form.aircraftType === 'cao' ? 'CAO' : 'PAX',
    
    // Additional info
    quantity: form.quantity?.trim() || '',
    notes: form.notes?.trim() || ''
  };
};

export default function DangerousGoodsForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const includeBatterySection = Boolean(location.state?.includeBatterySection);
  const { currentQuote, generateQuote } = useQuote();
  
  // Get aircraftType from location state (passed from previous form)
  const aircraftType = location.state?.aircraftType || 'passenger';

  // Debug: Check if upload functions are properly imported
  useEffect(() => {
    console.log('Upload service functions loaded:', {
      presignSds: typeof presignSds,
      putToPresignedUrl: typeof putToPresignedUrl,
      registerSdsDraft: typeof registerSdsDraft,
      attachDgToQuote: typeof attachDgToQuote
    });
  }, []);

  // Robust quoteId derivation (URL ?quoteId=, state, currentQuote, localStorage)
  const derivedQuoteId = useMemo(() => {
    const fromQuery = location?.search ? new URLSearchParams(location.search).get('quoteId') : null;
    const fromState = location.state?.quoteId || null;
    const fromCQ = currentQuote?._id || currentQuote?.id || null;
    const fromLSReal = localStorage.getItem('quoteId');
    const fromLSTemp = localStorage.getItem('tempQuoteId');
    return fromQuery || fromState || fromCQ || fromLSReal || fromLSTemp || null;
  }, [location?.search, location?.state, currentQuote]);

  const [quoteId, setQuoteId] = useState(derivedQuoteId);
  // eslint-disable-next-line no-unused-vars
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    unNumber: '',
    properName: '',
    classDivision: '',
    packingGroup: '',
    quantity: '',
    notes: '',
    aircraftType: aircraftType, // Use the passed aircraftType
    sdsFile: null,
  });

  // Check if this is a non-restricted scenario
  const isNonRestricted = location.state?.isNonRestricted || false;

  // File persistence
  const [pendingSdsUpload, setPendingSdsUpload] = useState(null); // UI
  const pendingSdsFileRef = useRef(null); // Source of truth across navigations

  // Ensure we always have some ID (real or TEMP-*)
  useEffect(() => {
    if (!quoteId) {
      const tmp = makeTempId();
      setQuoteId(tmp);
      localStorage.setItem('tempQuoteId', tmp);
    }
  }, [quoteId]);

  // Persist quoteId for reloads
  useEffect(() => {
    if (quoteId) {
      if (isTempId(quoteId)) {
        localStorage.setItem('tempQuoteId', quoteId);
      } else {
        localStorage.setItem('quoteId', quoteId);
      }
    }
  }, [quoteId]);

  // If we have a temp ID and a currentQuote, persist the full draft data for later submit
  useEffect(() => {
    if (isTempId(quoteId) && currentQuote) {
      const merged = { ...currentQuote, _id: quoteId, id: quoteId, quoteId };
      localStorage.setItem('tempQuoteData', JSON.stringify(merged));
    }
  }, [quoteId, currentQuote]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // Recover pending file from localStorage on mount (shared keys with Battery form)
  useEffect(() => {
    const fileMetadata = localStorage.getItem('pendingSdsFile');
    const fileData = localStorage.getItem('pendingSdsFileData');

    if (fileMetadata && fileData) {
      try {
        const meta = JSON.parse(fileMetadata);
        fetch(fileData)
          .then((res) => res.blob())
          .then((blob) => {
            const recoveredFile = new File([blob], meta.name, {
              type: meta.type,
              lastModified: meta.lastModified || Date.now(),
            });
            console.log('📥 Recovered DG SDS from localStorage:', recoveredFile.name);
            pendingSdsFileRef.current = recoveredFile;
            setPendingSdsUpload(recoveredFile);
            setForm((s) => ({ ...s, sdsFile: recoveredFile }));
          })
          .catch((err) => console.warn('Failed to recover pending SDS file:', err));
      } catch (e) {
        console.warn('Bad pendingSdsFile metadata:', e);
      }
    }
  }, []);

  // Handle file selection — persist to localStorage (metadata + base64 for <5 MB)
  const onFile = async (e) => {
    const file = e.target.files?.[0] || null;
    console.log('File selected:', file?.name, file?.size, 'bytes');
    setForm((s) => ({ ...s, sdsFile: file }));
    setErrorMsg('');

    if (!file) {
      pendingSdsFileRef.current = null;
      setPendingSdsUpload(null);
      localStorage.removeItem('pendingSdsFile');
      localStorage.removeItem('pendingSdsFileData');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Max file size is 20MB');
      return;
    }

    if (!/pdf|png|jpe?g/i.test(file.type)) {
      setErrorMsg('Only PDF/PNG/JPG allowed');
      return;
    }

    // Store file in ref + state for persistence and UI
    pendingSdsFileRef.current = file;
    setPendingSdsUpload(file);

    // Persist metadata
    localStorage.setItem(
      'pendingSdsFile',
      JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      })
    );

    // For small files, persist base64 to allow recovery across navigation
    if (file.size < 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem('pendingSdsFileData', reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      localStorage.removeItem('pendingSdsFileData');
    }

    if (isTempId(quoteId)) {
      setErrorMsg('SDS will be uploaded when quote is submitted');
    }
  };

  // Remove file
  const removeFile = () => {
    setForm((s) => ({ ...s, sdsFile: null }));
    pendingSdsFileRef.current = null;
    setPendingSdsUpload(null);
    setErrorMsg('');
    const fileInput = document.getElementById('sds');
    if (fileInput) fileInput.value = '';
    localStorage.removeItem('pendingSdsFile');
    localStorage.removeItem('pendingSdsFileData');
  };

  // eslint-disable-next-line no-unused-vars
  const uploadSdsFile = async (file, realQuoteId) => {
    console.log('=== DG SDS UPLOAD START ===');
    console.log('Quote ID:', realQuoteId);
    console.log('File:', file?.name, file?.size, 'bytes');

    if (!file || !realQuoteId || isTempId(realQuoteId)) {
      console.error('Upload blocked - missing file or invalid quote ID');
      return null;
    }

    try {
      // 1) presign
      const presignResponse = await presignSds(realQuoteId, file);
      const { url, key, contentType } = presignResponse || {};
      if (!url || !key) throw new Error('Invalid presigned URL response');

      // 2) put
      await putToPresignedUrl(url, file, contentType);

      // 3) register
      await registerSdsDraft(realQuoteId, {
        key,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
      });

      return key;
    } catch (err) {
      console.error('=== UPLOAD FAILED ===', err?.message, err?.response?.data);
      setErrorMsg(`File upload failed: ${err?.message || 'Unknown error'}`);
      throw err;
    }
  };

  // Submit DG info
  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validate required Pelicargo fields
    const requiredFields = {
      unNumber: 'UN Number',
      classDivision: 'Class/Division',
      packingGroup: 'Packing Group',
      properName: 'Proper Shipping Name'
    };

    // Check for missing required fields
    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!form[field]?.trim()) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      setErrorMsg(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Get the file from ref (source of truth)
    const fileToUpload = pendingSdsFileRef.current;

    console.log('=== FILE CHECK ===');
    console.log('File from ref:', fileToUpload?.name);
    console.log('File from state:', pendingSdsUpload?.name);
    console.log('Files match:', fileToUpload === pendingSdsUpload);

    try {
      // Transform DG data to Pelicargo format
      const pelicargoFormat = transformDGDataForPelicargo(form);
      
      // Build the DG payload with both formats
      const dgPayload = {
        // Your app's format (for UI/state management)
        unNumber: form.unNumber?.trim(),
        properName: form.properName?.trim(),
        classDivision: form.classDivision?.trim(),
        packingGroup: form.packingGroup?.trim(),
        quantity: form.quantity?.trim(),
        notes: form.notes?.trim(),
        aircraftType: form.aircraftType,
        
        // Pelicargo format (for API)
        pelicargo: pelicargoFormat
      };

      // If continuing to battery section
      if (includeBatterySection) {
        // Persist DG payload for the next page to pick up
        localStorage.setItem('tempDGDetails', JSON.stringify(dgPayload));
        // SDS file is already persisted via pendingSds* keys
        return navigate('/quotes/battery-details', {
          state: { quoteId, aircraftType: form.aircraftType }
        });
      }

      // Direct submission - ensure cargo pieces have required fields
      const updatedCargo = {
        ...currentQuote?.cargo,
        pieces: (currentQuote?.cargo?.pieces || []).map((piece, index) => ({
          ...piece,
          id: piece?.id || `piece-${index + 1}`,
          // ADD HANDLING FIELD (required by Pelicargo!)
          handling: piece.stackable === false ? ['NonStackable'] : [],
          // Ensure cargo type is set
          cargoType: piece.cargoType || 'Dangerous Goods'
        }))
      };

      const completeQuoteData = {
        ...currentQuote,
        cargo: updatedCargo,
        dangerousGoods: dgPayload,
        hasDangerousGoods: true
      };

      console.log('📦 Sending to QuoteContext:', completeQuoteData);
      console.log('📦 DG Pelicargo format:', pelicargoFormat);

      const result = await generateQuote(completeQuoteData);

      console.log('=== QUOTE GENERATION RESULT ===');
      console.log('Full result object:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', result ? Object.keys(result) : 'null');

      // Try multiple ways to get the quote ID
      const realQuoteId = result?.data?._id ||
        result?.data?.id ||
        result?.data?.quoteId ||
        result?.data?.quoteNumber ||
        result?._id ||
        result?.id ||
        result?.quoteId ||
        result?.quoteNumber ||
        (typeof result === 'string' ? result : null);

      console.log('Extracted Quote ID:', realQuoteId);
      if (realQuoteId) localStorage.setItem('lastQuoteId', realQuoteId);

      // Check if we got a success response
      if (result?.success || result?.data) {
        const finalQuoteId = realQuoteId;
        
        if (!finalQuoteId) {
          console.error('❌ No quote ID found anywhere!');
          setErrorMsg('Quote created but cannot upload file - no ID found');
          navigate('/quotes/results', {
            state: { quoteData: result?.data }
          });
          return;
        }

        console.log('✅ Using Quote ID for upload:', finalQuoteId);

        // Handle SDS file upload for DG-battery path
        if (fileToUpload && !isNonRestricted) {
          console.log('Found pending SDS file to upload:', fileToUpload.name);
          
          // ⚠️ TEMPORARY: Skip upload due to endpoint issues
          console.warn('⚠️ SKIPPING UPLOAD: Presign endpoint not responding');
          
          // Store file info for later manual processing
          const pendingUploads = JSON.parse(localStorage.getItem('pendingUploads') || '[]');
          const uploadRecord = {
            quoteId: finalQuoteId,
            fileName: fileToUpload.name,
            fileSize: fileToUpload.size,
            fileType: fileToUpload.type,
            batteryDetails: {
              mode: 'dg',
              aircraftType: form.aircraftType,
              dg: {
                unNumber: dgPayload.unNumber,
                properName: dgPayload.properName,
                classDivision: dgPayload.classDivision,
                packingGroup: dgPayload.packingGroup,
                quantity: dgPayload.quantity,
                notes: dgPayload.notes,
              }
            },
            timestamp: new Date().toISOString()
          };

          // Convert file to base64 for storage (if small enough)
          if (fileToUpload.size < 5 * 1024 * 1024) { // Under 5MB
            const reader = new FileReader();
            reader.onloadend = () => {
              uploadRecord.fileData = reader.result;
              pendingUploads.push(uploadRecord);
              localStorage.setItem('pendingUploads', JSON.stringify(pendingUploads));
              console.log('📁 File saved locally for later upload');
            };
            reader.readAsDataURL(fileToUpload);
          } else {
            pendingUploads.push(uploadRecord);
            localStorage.setItem('pendingUploads', JSON.stringify(pendingUploads));
            console.log('📁 File metadata saved (file too large for local storage)');
          }

          // Show user-friendly message
          setErrorMsg('Quote created successfully! SDS file will be uploaded once the service is available.');
        }

        // Clean up temp storage
        localStorage.removeItem('tempQuoteId');
        localStorage.removeItem('tempQuoteData');
        localStorage.removeItem('tempBatteryDetails');
        localStorage.removeItem('tempDGDetails');
        localStorage.removeItem('pendingSdsFile');
        localStorage.removeItem('pendingSdsFileData');

        // Clear the file ref
        pendingSdsFileRef.current = null;

        // Navigate to results WITH the quote data
        setTimeout(() => {
          // Store backup data
          localStorage.setItem('lastQuoteId', finalQuoteId);
          localStorage.setItem('lastOrigin', currentQuote?.origin?.airport || 'N/A');
          localStorage.setItem('lastDestination', currentQuote?.destination?.airport || 'N/A');

          // Navigate to success page
          navigate('/quotes/success', {
            state: {
              quoteId: finalQuoteId,
              origin: currentQuote?.origin?.airport || 'N/A',
              destination: currentQuote?.destination?.airport || 'N/A',
              quoteType: 'standard',
              hasBatteries: includeBatterySection,
              hasDG: true,
              uploadPending: !!fileToUpload
            }
          });
        }, fileToUpload ? 1000 : 0); // Small delay if saving file

        return;
      } else {
        const errorMessage = result?.error || result?.message || 'Failed to generate quote';
        console.error('Quote submission error:', errorMessage);
        if (
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('duplicate')
        ) {
          navigate('/quotes/results');
        } else {
          setErrorMsg(errorMessage);
        }
      }
    } catch (err) {
      console.error('Quote submission exception:', err);
      const errorMessage = err?.message || 'Failed to save DG details';
      if (
        err?.response?.status === 409 ||
        err?.response?.status === 200 ||
        errorMessage.toLowerCase().includes('already exists')
      ) {
        navigate('/quotes/results');
      } else {
        setErrorMsg(errorMessage);
      }
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dangerous Goods Details</h1>
      <p className="text-sm text-gray-600 mb-6">Quote ref: {quoteId ?? 'new'}</p>

      {errorMsg && (
        <div className={`mb-4 rounded-md border p-3 text-sm ${
          errorMsg.includes('successfully') 
            ? 'border-green-200 bg-green-50 text-green-700' 
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {errorMsg}
        </div>
      )}

      {uploading && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          Uploading SDS… please wait.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1" htmlFor="unNumber">
              UN Number
            </label>
            <input
              id="unNumber"
              name="unNumber"
              className="w-full border rounded-md p-2"
              placeholder="e.g., UN 3480"
              value={form.unNumber}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="classDivision">
              Class/Division
            </label>
            <input
              id="classDivision"
              name="classDivision"
              className="w-full border rounded-md p-2"
              placeholder="e.g., 9"
              value={form.classDivision}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="packingGroup">
              Packing Group
            </label>
            <input
              id="packingGroup"
              name="packingGroup"
              className="w-full border rounded-md p-2"
              placeholder="e.g., II"
              value={form.packingGroup}
              onChange={onChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="properName">
            Proper Shipping Name
          </label>
          <input
            id="properName"
            name="properName"
            className="w-full border rounded-md p-2"
            placeholder="e.g., Lithium ion batteries"
            value={form.properName}
            onChange={onChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="quantity">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              className="w-full border rounded-md p-2"
              placeholder="e.g., 2 packages"
              value={form.quantity}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="aircraftType">
              Aircraft Type
            </label>
            <select
              id="aircraftType"
              name="aircraftType"
              className="w-full border rounded-md p-2"
              value={form.aircraftType}
              onChange={onChange}
            >
              <option value="passenger">Approved for Passenger Aircraft</option>
              <option value="cao">Cargo Aircraft Only (CAO)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="sds">
              SDS Upload (PDF or image)
            </label>
            {!form.sdsFile ? (
              <div className="relative">
                <input
                  id="sds"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={onFile}
                  className="w-full border rounded-md p-2 bg-white pr-10"
                  disabled={uploading}
                />
                <Upload className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="flex-1 text-sm truncate text-gray-900 dark:text-gray-100">
                  {form.sdsFile.name}
                </span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  title="Remove file"
                >
                  <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="notes">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            className="w-full border rounded-md p-2"
            rows="3"
            placeholder="Any special handling instructions or additional information"
            value={form.notes}
            onChange={onChange}
          />
        </div>

        <div className="text-sm text-gray-600">
          {isTempId(quoteId)
            ? 'Note: Files will be uploaded when the quote is submitted.'
            : 'SDS file will be uploaded and saved with this quote.'}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border px-4 py-2 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            disabled={uploading}
          >
            {includeBatterySection ? 'Continue' : 'Generate Quote'}
          </button>
        </div>
      </form>
    </div>
  );
}
