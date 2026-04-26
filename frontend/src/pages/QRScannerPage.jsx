import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function QRScannerPage() {
  const [scanResult, setScanResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(success, error);

    function success(result) {
      scanner.clear();
      setScanResult(result);
      
      // Assuming the QR code contains the resourceId directly.
      // Call backend to get facility details
      axios.get(`http://localhost:8080/api/tickets/scan/${result}`)
        .then(res => {
           // Navigate to tickets page with pre-filled state
           navigate('/tickets', { state: { autoOpen: true, resourceId: res.data.resourceId, facilityName: res.data.facilityName } });
        })
        .catch(err => {
           console.error("Scan error", err);
           alert("Invalid QR code for facility.");
        });
    }

    function error(err) {
      console.warn(err);
    }

    return () => {
      scanner.clear();
    };
  }, [navigate]);

  return (
    <div className="page" style={{ textAlign: 'center', padding: '40px' }}>
      <h1>Scan Facility QR Code</h1>
      <p>Scan the QR code located on the wall of the facility to quickly report an issue.</p>
      {scanResult ? (
        <div>Success: {scanResult}</div>
      ) : (
        <div id="reader" style={{ margin: '0 auto', width: '400px' }}></div>
      )}
    </div>
  );
}
