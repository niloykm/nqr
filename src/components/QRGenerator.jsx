import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { 
  Download, Copy, Share2, Sparkles, Upload, 
  Globe, Mail, MessageSquare, Wifi, Phone, 
  MapPin, Calendar, Heart, CircleDot, RefreshCw
} from 'lucide-react';

const QRGenerator = ({ isPro, onGenerateSuccess, addAlert }) => {
  // Core config
  const [contentType, setContentType] = useState('url');
  const [value, setValue] = useState('https://niloykm.vercel.app/');
  
  // Specific Type Inputs
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [phone, setPhone] = useState('');
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [geoLat, setGeoLat] = useState('');
  const [geoLng, setGeoLng] = useState('');
  const [vCardName, setVCardName] = useState('');
  const [vCardPhone, setVCardPhone] = useState('');
  const [vCardEmail, setVCardEmail] = useState('');
  const [vCardOrg, setVCardOrg] = useState('');
  
  // Style Customization State
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor, setGradientColor] = useState('#2563eb');
  const [gradientType, setGradientType] = useState('linear'); // linear, radial
  const [dotStyle, setDotStyle] = useState('rounded'); // rounded, dots, classy, classy-rounded, square
  const [eyeStyle, setEyeStyle] = useState('square'); // square, rounded, dot
  const [errorCorrection, setErrorCorrection] = useState('Q'); // L, M, Q, H
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoSize, setLogoSize] = useState(0.2); // 0.1 to 0.3
  const [resolution, setResolution] = useState(300); // 300 to 1000 px
  
  // Frame Option
  const [useFrame, setUseFrame] = useState(false);
  const [frameText, setFrameText] = useState('SCAN ME');

  // Preview container reference
  const previewRef = useRef(null);
  const qrStylingRef = useRef(null);

  // Generate payload depending on content type
  const getPayload = () => {
    switch (contentType) {
      case 'url':
        return value.startsWith('http') ? value : `https://${value}`;
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'sms':
        return `SMSTO:${smsPhone}:${smsMessage}`;
      case 'phone':
        return `tel:${phone}`;
      case 'geo':
        return `geo:${geoLat},${geoLng}`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nN:${vCardName}\nTEL:${vCardPhone}\nEMAIL:${vCardEmail}\nORG:${vCardOrg}\nEND:VCARD`;
      default:
        return value;
    }
  };

  // Contrast check YIQ logic
  const checkContrast = (hex1, hex2) => {
    const getRGB = (hex) => {
      const r = parseInt(hex.substring(1, 3), 16);
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);
      return [r, g, b];
    };
    const yiq = ([r, g, b]) => (r * 299 + g * 587 + b * 114) / 1000;
    const diff = Math.abs(yiq(getRGB(hex1)) - yiq(getRGB(hex2)));
    return diff > 125; // Good contrast standard
  };

  const isScannable = checkContrast(fgColor, bgColor);

  // Re-instantiate / Update QR instance
  useEffect(() => {
    const payload = getPayload();
    if (!payload) return;

    const options = {
      width: resolution,
      height: resolution,
      data: payload,
      margin: useFrame ? 40 : 10,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: errorCorrection,
      },
      dotsOptions: {
        color: fgColor,
        type: dotStyle,
        ...(useGradient ? {
          gradient: {
            type: gradientType,
            rotation: 45,
            colorStops: [
              { offset: 0, color: fgColor },
              { offset: 1, color: gradientColor }
            ]
          }
        } : {})
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: eyeStyle,
        color: fgColor,
      },
      cornersDotOptions: {
        type: eyeStyle === 'square' ? 'square' : 'dot',
        color: fgColor,
      },
      ...(logoPreview ? {
        image: logoPreview,
        imageOptions: {
          crossOrigin: 'anonymous',
          hideBackgroundDots: true,
          imageSize: logoSize,
          margin: 4
        }
      } : {})
    };

    if (previewRef.current) {
      previewRef.current.innerHTML = '';
      qrStylingRef.current = new QRCodeStyling(options);
      
      // Draw canvas
      const drawCanvas = async () => {
        const qrContainer = document.createElement('div');
        await qrStylingRef.current.append(qrContainer);
        
        // Custom framing wrapper
        if (useFrame && previewRef.current) {
          const wrapper = document.createElement('div');
          wrapper.className = "flex flex-col items-center p-3 rounded-2xl bg-white border-4 shadow-md";
          wrapper.style.borderColor = fgColor;
          
          const textDiv = document.createElement('div');
          textDiv.className = "font-bold text-center py-2 tracking-wide uppercase";
          textDiv.style.color = fgColor;
          textDiv.innerText = frameText;
          
          // Append elements
          const innerCanvas = qrContainer.querySelector('canvas');
          if (innerCanvas) {
            wrapper.appendChild(innerCanvas);
            wrapper.appendChild(textDiv);
            previewRef.current.appendChild(wrapper);
          }
        } else {
          previewRef.current.appendChild(qrContainer.firstChild);
        }
      };

      drawCanvas();
    }
  }, [
    contentType, value, wifiSsid, wifiPassword, wifiEncryption,
    emailTo, emailSubject, emailBody, phone, smsPhone, smsMessage,
    geoLat, geoLng, vCardName, vCardPhone, vCardEmail, vCardOrg,
    fgColor, bgColor, useGradient, gradientColor, gradientType,
    dotStyle, eyeStyle, errorCorrection, logoPreview, logoSize, 
    resolution, useFrame, frameText
  ]);

  const handleDownload = async (format) => {
    if (!qrStylingRef.current) return;
    addAlert(`Downloading QR Code as ${format.toUpperCase()}...`, 'info');
    
    // Auto-save generation to history
    onGenerateSuccess({
      id: Math.random().toString(36).substring(2, 9),
      type: contentType,
      value: getPayload(),
      timestamp: new Date().toISOString()
    });

    if (format === 'pdf') {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [400, 400]
      });
      // Append QR as image onto PDF
      const rawData = await qrStylingRef.current.getRawData('png');
      const reader = new FileReader();
      reader.readAsDataURL(rawData);
      reader.onloadend = () => {
        doc.addImage(reader.result, 'PNG', 50, 50, 300, 300);
        doc.save('qr-code.pdf');
        confetti({ particleCount: 80, spread: 60 });
      };
    } else {
      await qrStylingRef.current.download({ name: 'nqr-code', extension: format });
      confetti({ particleCount: 80, spread: 60 });
    }
  };

  const copyToClipboard = async () => {
    if (!qrStylingRef.current) return;
    try {
      const blob = await qrStylingRef.current.getRawData('png');
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      addAlert('Image copied to clipboard!', 'success');
      confetti({ particleCount: 50, spread: 40 });
    } catch (err) {
      console.error(err);
      addAlert('Clipboard copy failed. Re-try manually.', 'error');
    }
  };

  const shareQR = async () => {
    if (!navigator.share) {
      addAlert('Sharing not supported on this device', 'error');
      return;
    }
    try {
      const blob = await qrStylingRef.current.getRawData('png');
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });
      await navigator.share({
        title: 'NQR Code',
        text: 'Scanned via NQR Generator',
        files: [file]
      });
      addAlert('Shared successfully!', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Drag & drop logo files
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!isPro) {
        addAlert('Adding center logos requires Pro!', 'error');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setLogoPreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-5 gap-8 items-start animate-fade-in">
      
      {/* Content Form & Customizers */}
      <div className="lg:col-span-3 space-y-6">
        {/* Content Type Selector */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Select Content Type</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {[
              { id: 'url', label: 'URL', icon: <Globe className="h-4 w-4" /> },
              { id: 'wifi', label: 'WiFi', icon: <Wifi className="h-4 w-4" /> },
              { id: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
              { id: 'sms', label: 'SMS', icon: <MessageSquare className="h-4 w-4" /> },
              { id: 'phone', label: 'Call', icon: <Phone className="h-4 w-4" /> },
              { id: 'vcard', label: 'vCard', icon: <RefreshCw className="h-4 w-4" /> },
              { id: 'geo', label: 'Geo', icon: <MapPin className="h-4 w-4" /> },
              { id: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setContentType(type.id)}
                className={`py-2 px-1.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-[11px] font-semibold truncate ${
                  contentType === type.id
                    ? 'border-blue-600 bg-blue-50/50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                    : 'border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {type.icon}
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Details */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Enter Details</h3>
          
          {contentType === 'url' && (
            <input
              type="text"
              placeholder="https://example.com"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-mono text-sm"
            />
          )}

          {contentType === 'wifi' && (
            <div className="grid gap-3">
              <input
                type="text"
                placeholder="Network Name (SSID)"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="password"
                placeholder="Password"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
              <select
                value={wifiEncryption}
                onChange={(e) => setWifiEncryption(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Unencrypted</option>
              </select>
            </div>
          )}

          {contentType === 'email' && (
            <div className="grid gap-3">
              <input
                type="email"
                placeholder="Send To"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="text"
                placeholder="Subject Line"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
              <textarea
                placeholder="Message Body..."
                rows={3}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {contentType === 'sms' && (
            <div className="grid gap-3">
              <input
                type="tel"
                placeholder="Recipient Phone Number"
                value={smsPhone}
                onChange={(e) => setSmsPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
              <textarea
                placeholder="SMS Text message..."
                rows={3}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {contentType === 'phone' && (
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
            />
          )}

          {contentType === 'geo' && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Latitude (e.g. 40.7128)"
                value={geoLat}
                onChange={(e) => setGeoLat(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="text"
                placeholder="Longitude (e.g. -74.0060)"
                value={geoLng}
                onChange={(e) => setGeoLng(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {contentType === 'vcard' && (
            <div className="grid gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={vCardName}
                onChange={(e) => setVCardName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={vCardPhone}
                onChange={(e) => setVCardPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={vCardEmail}
                onChange={(e) => setVCardEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="text"
                placeholder="Company / Organization"
                value={vCardOrg}
                onChange={(e) => setVCardOrg(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {contentType === 'calendar' && (
            <input
              type="datetime-local"
              onChange={(e) => setValue(`BEGIN:VEVENT\nSUMMARY:Event\nDTSTART:${e.target.value.replace(/[-:]/g, '')}Z\nEND:VEVENT`)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-all"
            />
          )}
        </div>

        {/* Customization Options */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <h3 className="text-sm font-semibold text-slate-850 dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-blue-500" /> Customize Design
            </h3>
            {!isPro && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 px-2 py-0.5 rounded">
                Basic Mode
              </span>
            )}
          </div>

          {/* Color Pickers */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Foreground Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-10 w-10 border-0 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-10 border-0 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl border dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Contrast Health Warning */}
          {!isScannable && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2 border border-rose-100 dark:border-rose-900/40">
              <Heart className="h-4 w-4 flex-shrink-0 fill-rose-500 text-rose-500" />
              <span><strong>Warning:</strong> Contrast ratio is low. The code may be difficult for cameras to scan.</span>
            </div>
          )}

          {/* Pro Styling Block */}
          <div className={`space-y-6 pt-4 border-t border-slate-100 dark:border-slate-850 ${!isPro ? 'opacity-40 pointer-events-none' : ''}`}>
            {/* Gradients */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <CircleDot className="h-4 w-4 text-blue-500" /> Enable Color Gradients
              </label>
              <input
                type="checkbox"
                checked={useGradient}
                onChange={(e) => setUseGradient(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {useGradient && (
              <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-500">Gradient Stop Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={gradientColor}
                      onChange={(e) => setGradientColor(e.target.value)}
                      className="h-10 w-10 border-0 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={gradientColor}
                      onChange={(e) => setGradientColor(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-500">Gradient Shape</label>
                  <select
                    value={gradientType}
                    onChange={(e) => setGradientType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm outline-none"
                  >
                    <option value="linear">Linear 45deg</option>
                    <option value="radial">Radial Gradient</option>
                  </select>
                </div>
              </div>
            )}

            {/* Custom Dot and Eye style */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Matrix Dot Style
                </label>
                <select
                  value={dotStyle}
                  onChange={(e) => setDotStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm outline-none"
                >
                  <option value="rounded">Rounded Dots</option>
                  <option value="dots">Circular Dots</option>
                  <option value="classy">Classy Squares</option>
                  <option value="classy-rounded">Classy Rounded</option>
                  <option value="square">Legacy Square</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Corner Eye Shape
                </label>
                <select
                  value={eyeStyle}
                  onChange={(e) => setEyeStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm outline-none"
                >
                  <option value="square">Square corners</option>
                  <option value="rounded">Rounded corners</option>
                  <option value="dot">Circular eye</option>
                </select>
              </div>
            </div>

            {/* Center Logo Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Center Overlay Logo
              </label>
              <div className="flex items-center gap-4">
                <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-medium text-xs rounded-xl cursor-pointer flex items-center gap-1.5">
                  <Upload className="h-4 w-4" /> Choose Logo File
                  <input type="file" onChange={handleLogoUpload} accept="image/*" className="hidden" />
                </label>
                {logoPreview && (
                  <button
                    onClick={() => { setLogoFile(null); setLogoPreview(''); }}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>

            {/* Framing Options */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Enable Visual QR Frame
              </label>
              <input
                type="checkbox"
                checked={useFrame}
                onChange={(e) => setUseFrame(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {useFrame && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-[11px] font-semibold text-slate-500">Frame Label</label>
                <input
                  type="text"
                  value={frameText}
                  onChange={(e) => setFrameText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-time preview panel */}
      <div className="lg:col-span-2 lg:sticky lg:top-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center gap-6">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider self-start">Live Preview</h3>
        
        {/* Render container */}
        <div 
          ref={previewRef} 
          className="p-4 bg-white rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center w-full max-w-[320px] aspect-square qr-preview-container"
        />

        {/* Size Slider */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Export Resolution</span>
            <span>{resolution} x {resolution} px</span>
          </div>
          <input
            type="range"
            min="300"
            max="1000"
            step="100"
            value={resolution}
            onChange={(e) => setResolution(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Actions grid */}
        <div className="w-full grid grid-cols-2 gap-3">
          <button
            onClick={() => handleDownload('png')}
            className="py-2.5 px-4 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
          <button
            onClick={() => handleDownload('svg')}
            disabled={!isPro}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export SVG
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={!isPro}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Export PDF
          </button>
          <button
            onClick={copyToClipboard}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Copy className="h-4 w-4" /> Copy Image
          </button>
        </div>

        {/* Web Share */}
        <button
          onClick={shareQR}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-blue-500/10"
        >
          <Share2 className="h-4 w-4" /> Share QR Code
        </button>
      </div>

    </div>
  );
};

export default QRGenerator;
