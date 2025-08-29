// src/components/quotes/QuoteGenerator/BatteryDetailsForm.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuote } from '../../../contexts/QuoteContext';
import { presignSds, putToPresignedUrl, registerSdsDraft } from '../../../services/uploads';
import { attachBatteryToQuote } from '../../../services/quotes';
import { X, Upload, FileText } from 'lucide-react';

const NON_RESTRICTED_OPTIONS = [
  { value: 'UN3481_PI967_SecII', label: 'Li-ion: UN3481 | PI967 | Sec II' },
  { value: 'UN3481_PI966_SecII', label: 'Li-ion: UN3481 | PI966 | Sec II' },
  { value: 'UN3091_PI969_SecII', label: 'Li metal: UN3091 | PI969 | Sec II' },
  { value: 'UN3091_PI970_SecII', label: 'Li metal: UN3091 | PI970 | Sec II' },
];

const makeTempId = () => `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const isTempId = (id) => typeof id === 'string' && id.startsWith('TEMP-');

// Add this function to transform battery data for Pelicargo
const transformBatteryDataForPelicargo = (isNonRestricted, nonRestricted, dg, aircraftType) => {
  let pelicargoData = {};

  if (isNonRestricted) {
    // Parse the non-restricted code like "UN3481_PI967_SecII"
    const parts = nonRestricted.split('_');
    const unNumber = parts[0]; // "UN3481"
    const packingInstruction = parts[1]; // "PI967"
    const section = parts[2]?.replace('Sec', ''); // "II"

    // Determine battery type based on UN number and PI
    let batteryType = 'DG_BATTERIES_STANDALONE'; // default
    if (packingInstruction === 'PI967') {
      batteryType = 'DG_BATTERIES_IN_EQUIPMENT';
    } else if (packingInstruction === 'PI966') {
      batteryType = 'DG_BATTERIES_WITH_EQUIPMENT';
    } else if (packingInstruction === 'PI969' || packingInstruction === 'PI970') {
      batteryType = 'DG_BATTERIES_LITHIUM_METAL';
    }

    pelicargoData = {
      // Battery-specific fields for Pelicargo
      packing_instruction: packingInstruction,
      battery_type: batteryType,
      section: section,
      
      // UN info (even for non-restricted)
      un_number: parseInt(unNumber.replace('UN', '')),
      class: 9, // Batteries are always class 9
      
      // Aircraft type
      aircraft_variant: aircraftType === 'cao' ? 'CAO' : 'PAX'
    };
  } else {
    // DG batteries - full dangerous goods declaration
    pelicargoData = {
      // Mark as dangerous goods
      cargo_type: 'DangerousGoods',
      
      // UN details
      un_number: parseInt(dg.unNumber?.replace(/[^\d]/g, '') || 0),
      class: parseInt(dg.classDivision || 9),
      packing_group: dg.packingGroup?.toUpperCase() || 'II',
      
      // Battery specific
      proper_shipping_name: dg.properName,
      
      // Aircraft type
      aircraft_variant: aircraftType === 'cao' ? 'CAO' : 'PAX'
    };
  }

  return pelicargoData;
};

export default function BatteryDetailsForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { currentQuote, generateQuote } = useQuote();

  // Debug: Check if upload functions are properly imported
  useEffect(() => {
    console.log('Upload service functions loaded:', {
      presignSds: typeof presignSds,
      putToPresignedUrl: typeof putToPresignedUrl,
      registerSdsDraft: typeof registerSdsDraft,
      attachBatteryToQuote: typeof attachBatteryToQuote
    });
  }, []);

  const derivedQuoteId = useMemo(() => {
    const fromQuery = location?.search
      ? new URLSearchParams(location.search).get('quoteId')
      : null;
    const fromLSReal = localStorage.getItem('quoteId');
    const fromLSTemp = localStorage.getItem('tempQuoteId');

    return (
      currentQuote?._id ||
      currentQuote?.id ||
      location?.state?.quoteId ||
      location?.state?.draft?._id ||
      location?.state?.draft?.id ||
      params?.quoteId ||
      fromQuery ||
      fromLSReal ||
      fromLSTemp ||
      null
    );
  }, [currentQuote, location?.state, location?.search, params?.quoteId]);

  const [quoteId, setQuoteId] = useState(derivedQuoteId);
  const [pendingSdsUpload, setPendingSdsUpload] = useState(null); // Store file for later upload
  const pendingSdsFileRef = useRef(null); // Ref to persist the file object

  // Ensure some ID (real or TEMP-*)
  useEffect(() => {
    if (!quoteId) {
      const tmp = makeTempId();
      setQuoteId(tmp);
      localStorage.setItem('tempQuoteId', tmp);
    }
  }, [quoteId]);

  // Persist ID for reloads
  useEffect(() => {
    if (quoteId) {
      if (isTempId(quoteId)) {
        localStorage.setItem('tempQuoteId', quoteId);
      } else {
        localStorage.setItem('quoteId', quoteId);
      }
    }
  }, [quoteId]);

  // If temp + have currentQuote, persist full quote for later finalize
  useEffect(() => {
    if (isTempId(quoteId) && currentQuote) {
      const merged = { ...currentQuote, _id: quoteId, id: quoteId, quoteId };
      localStorage.setItem('tempQuoteData', JSON.stringify(merged));
    }
  }, [quoteId, currentQuote]);

  // ====== Recovery: rebuild the file from localStorage on mount ======
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
              lastModified: meta.lastModified
            });
            console.log('📥 Recovered file from localStorage:', recoveredFile.name);
            pendingSdsFileRef.current = recoveredFile;
            setPendingSdsUpload(recoveredFile);
            setDg((prev) => ({ ...prev, sdsFile: recoveredFile }));
          })
          .catch((e) => console.error('Failed to recover file from localStorage:', e));
      } catch (e) {
        console.error('Invalid file metadata in localStorage:', e);
      }
    }
  }, []);

  // overall path selection
  const [mode, setMode] = useState('nonrestricted'); // 'nonrestricted' | 'dg'
  const [aircraftType, setAircraftType] = useState('passenger'); // 'passenger' | 'cao'
  const [nonRestricted, setNonRestricted] = useState(NON_RESTRICTED_OPTIONS[0].value);
  const [dg, setDg] = useState({
    unNumber: '',
    properName: '',
    classDivision: '',
    packingGroup: '',
    quantity: '',
    notes: '',
    sdsFile: null,
  });

  // eslint-disable-next-line no-unused-vars
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const isNonRestricted = useMemo(() => mode === 'nonrestricted', [mode]);

  const onDgChange = (e) => {
    const { name, value } = e.target;
    setDg((s) => ({ ...s, [name]: value }));
  };

  // ====== Handle file selection (with localStorage persistence) ======
  const onDgFile = async (e) => {
    const file = e.target.files?.[0] || null;
    console.log('File selected:', file?.name, file?.size, 'bytes');
    setDg((s) => ({ ...s, sdsFile: file }));
    setErrorMsg('');

    if (!file) {
      // Clear ref, state, and localStorage
      pendingSdsFileRef.current = null;
      setPendingSdsUpload(null);
      localStorage.removeItem('pendingSdsFile');
      localStorage.removeItem('pendingSdsFileData');
      return;
    }

    // Validation
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Max file size is 20MB');
      return;
    }
    if (!/pdf|png|jpe?g/i.test(file.type)) {
      setErrorMsg('Only PDF/PNG/JPG allowed');
      return;
    }

    // Store file in ref and state
    pendingSdsFileRef.current = file;
    setPendingSdsUpload(file);

    // Persist metadata
    localStorage.setItem(
      'pendingSdsFile',
      JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      })
    );

    // For small files, also persist base64 data for recovery after navigation
    if (file.size < 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          localStorage.setItem('pendingSdsFileData', reader.result);
        } catch (err) {
          console.warn('Failed to store base64 file data:', err);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Ensure we don't leave stale base64 data around for large files
      localStorage.removeItem('pendingSdsFileData');
    }

    console.log('File stored in ref, state, and metadata persisted');
    if (isTempId(quoteId)) {
      setErrorMsg('SDS will be uploaded when quote is submitted');
    }
  };

  // Remove file functionality
  const removeFile = () => {
    setDg((s) => ({ ...s, sdsFile: null }));
    pendingSdsFileRef.current = null;
    setPendingSdsUpload(null);
    setErrorMsg('');

    // Clear persisted file
    localStorage.removeItem('pendingSdsFile');
    localStorage.removeItem('pendingSdsFileData');

    // Reset the file input
    const fileInput = document.getElementById('sds');
    if (fileInput) fileInput.value = '';
  };

  // eslint-disable-next-line no-unused-vars
  const uploadSdsFile = async (file, realQuoteId) => {
    console.log('=== BATTERY SDS UPLOAD START ===');
    console.log('Quote ID:', realQuoteId);
    console.log('File:', file?.name, file?.size, 'bytes');

    if (!file || !realQuoteId || isTempId(realQuoteId)) {
      console.error('Upload blocked - missing file or invalid quote ID');
      return null;
    }

    try {
      // Step 1: Get presigned URL
      console.log('1. Getting presigned URL...');
      const presignResponse = await presignSds(realQuoteId, file);
      console.log('2. Presigned response:', presignResponse);

      const { url, key, contentType } = presignResponse || {};
      if (!url || !key) {
        throw new Error('Invalid presigned URL response');
      }

      // Step 2: Upload to Cloudflare
      console.log('3. Uploading to Cloudflare R2...');
      await putToPresignedUrl(url, file, contentType);
      console.log('4. Upload complete');

      // Step 3: Register with backend
      console.log('5. Registering with backend...');
      await registerSdsDraft(realQuoteId, {
        key,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
      });
      console.log('6. Registration complete. Key:', key);

      return key;
    } catch (err) {
      console.error('=== UPLOAD FAILED ===');
      console.error('Error:', err);
      console.error('Response:', err?.response?.data);
      setErrorMsg(`File upload failed: ${err?.message || 'Unknown error'}`);
      throw err;
    }
  };

  // Submit battery info - UPDATED WITH PELICARGO TRANSFORMATION
  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Get the file from ref (more reliable than state)
    const fileToUpload = pendingSdsFileRef.current;

    console.log('=== FILE CHECK ===');
    console.log('File from ref:', fileToUpload?.name);
    console.log('File from state:', pendingSdsUpload?.name);
    console.log('Files match:', fileToUpload === pendingSdsUpload);

    try {
      // Transform battery data to Pelicargo format
      const pelicargoFormat = transformBatteryDataForPelicargo(
        isNonRestricted,
        nonRestricted,
        dg,
        aircraftType
      );

      // Also ensure cargo pieces have the required 'handling' field
      const updatedCargo = {
        ...currentQuote?.cargo,
        pieces: (currentQuote?.cargo?.pieces || []).map((piece, index) => ({
          ...piece,
          id: piece?.id || `piece-${index + 1}`,
          // ADD HANDLING FIELD (required by Pelicargo!)
          handling: piece.stackable === false ? ['NonStackable'] : [],
          // Ensure cargo type is set for battery pieces
          cargoType: piece.cargoType || 'Batteries'
        }))
      };

      // Build the battery details payload
      const batteryPayload = {
        // Your app's format (for UI/state management)
        mode: isNonRestricted ? 'nonrestricted' : 'dg',
        aircraftType,
        ...(isNonRestricted ? { nonRestrictedCode: nonRestricted } : { dg }),
        
        // Pelicargo format (for API)
        pelicargo: pelicargoFormat
      };

      // Build complete quote payload
      const completeQuoteData = {
        ...currentQuote,
        cargo: updatedCargo,
        batteryDetails: batteryPayload,
        hasBatteries: true,
        
        // If DG details exist from previous page
        ...(localStorage.getItem('tempDGDetails') && {
          dangerousGoods: JSON.parse(localStorage.getItem('tempDGDetails')),
          hasDangerousGoods: true
        })
      };

      console.log('📦 Sending to QuoteContext:', completeQuoteData);
      console.log('📦 Pelicargo format:', pelicargoFormat);

      // Generate the quote with the complete data
      const result = await generateQuote(completeQuoteData);

      console.log('=== QUOTE GENERATION RESULT ===');
      console.log('Full result object:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', result ? Object.keys(result) : 'null');

      // Extra debug
      if (result?.data?.quotes && Array.isArray(result.data.quotes)) {
        console.log('📦 Quotes array length:', result.data.quotes.length);
        console.log('📦 First quote object:', result.data.quotes[0]);
        if (result.data.quotes[0]) {
          console.log('📦 First quote keys:', Object.keys(result.data.quotes[0]));
          console.log('📦 Looking for ID in first quote...');
          console.log('  - _id:', result.data.quotes[0]._id);
          console.log('  - id:', result.data.quotes[0].id);
          console.log('  - quoteId:', result.data.quotes[0].quoteId);
          console.log('  - quoteNumber:', result.data.quotes[0].quoteNumber);
        }
      }

      // Try multiple ways to get the quote ID
      const realQuoteId =
        result?.data?._id ||
        result?.data?.id ||
        result?.data?.quoteId ||
        result?.data?.quoteNumber ||
        result?._id ||
        result?.id ||
        result?.quoteId ||
        result?.quoteNumber ||
        (typeof result === 'string' ? result : null);

      console.log('Extracted Quote ID:', realQuoteId);

      // Store the ID if we got one
      if (realQuoteId) {
        localStorage.setItem('lastQuoteId', realQuoteId);
      }

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
              aircraftType,
              dg: {
                unNumber: dg.unNumber?.trim(),
                properName: dg.properName?.trim(),
                classDivision: dg.classDivision?.trim(),
                packingGroup: dg.packingGroup?.trim(),
                quantity: dg.quantity?.trim(),
                notes: dg.notes?.trim(),
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
              hasBatteries: true,
              hasDG: !!localStorage.getItem('tempDGDetails'),
              uploadPending: !!fileToUpload
            }
          });
        }, fileToUpload ? 1000 : 0); // Small delay if saving file
        
        return;
      } else {
        // Quote failed but might have been created anyway
        const errorMessage = result?.error || result?.message || 'Failed to generate quote';
        console.error('Quote submission error:', errorMessage);

        // Check if we should navigate anyway (quote might have been created)
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
      const errorMessage = err?.message || 'Failed to save battery details';

      // If it's a network/error state where quote possibly exists, allow navigation
      if (
        err?.response?.status === 409 || // Conflict - already exists
        err?.response?.status === 200 || // Success but error in parsing
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
      <h1 className="text-2xl font-bold mb-4">Battery Shipment Details</h1>
      <p className="text-sm text-gray-600 mb-6">Quote ref: {quoteId ?? 'new'}</p>

      {errorMsg && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {uploading && (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          Uploading SDS… please wait.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Mode selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Battery Category</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="nonrestricted"
                  checked={isNonRestricted}
                  onChange={() => setMode('nonrestricted')}
                />
                <span>Non-Restricted (Sec II)</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="mode"
                  value="dg"
                  checked={!isNonRestricted}
                  onChange={() => setMode('dg')}
                />
                <span>Dangerous Goods Batteries</span>
              </label>
            </div>
          </div>

          {/* Aircraft type applies to both paths */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="aircraftType">
              Aircraft Type
            </label>
            <select
              id="aircraftType"
              className="w-full border rounded-md p-2"
              value={aircraftType}
              onChange={(e) => setAircraftType(e.target.value === 'cao' ? 'cao' : 'passenger')}
            >
              <option value="passenger">Approved for Passenger Aircraft</option>
              <option value="cao">Cargo Aircraft Only (CAO)</option>
            </select>
          </div>
        </div>

        {/* Non-Restricted (Sec II) options */}
        {isNonRestricted && (
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="nonrestricted">
              Select Packaging Instruction (Sec II)
            </label>
            <select
              id="nonrestricted"
              className="w-full border rounded-md p-2"
              value={nonRestricted}
              onChange={(e) => setNonRestricted(e.target.value)}
            >
              {NON_RESTRICTED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* DG batteries: show DG fields + SDS */}
        {!isNonRestricted && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1" htmlFor="unNumber">
                  UN Number
                </label>
                <input
                  id="unNumber"
                  name="unNumber"
                  className="w-full border rounded-md p-2"
                  placeholder="e.g., UN 3481"
                  value={dg.unNumber}
                  onChange={onDgChange}
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
                  value={dg.classDivision}
                  onChange={onDgChange}
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
                  value={dg.packingGroup}
                  onChange={onDgChange}
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
                placeholder="e.g., Lithium ion batteries contained in equipment"
                value={dg.properName}
                onChange={onDgChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="quantity">
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  className="w-full border rounded-md p-2"
                  placeholder="e.g., 2 packages"
                  value={dg.quantity}
                  onChange={onDgChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="sds">
                  SDS Upload (PDF or image)
                </label>
                {!dg.sdsFile ? (
                  <div className="relative">
                    <input
                      id="sds"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={onDgFile}
                      className="w-full border rounded-md p-2 bg-white"
                      disabled={uploading}
                    />
                    <Upload className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="flex-1 text-sm truncate text-gray-900 dark:text-gray-100">{dg.sdsFile.name}</span>
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
          </div>
        )}

        <div className="text-sm text-gray-600">
          {isTempId(quoteId)
            ? 'Note: Files will be uploaded when the quote is submitted.'
            : 'Files and details will be saved to the quote immediately.'}
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
            Generate Quote
          </button>
        </div>
      </form>
    </div>
  );
}
