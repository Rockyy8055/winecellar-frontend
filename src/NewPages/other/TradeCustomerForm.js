import React, { useState } from 'react';
import Layout from '../../layouts/Layout';

const TradeCustomerForm = () => {
  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    registeredAddress: '',
    correspondingAddress: '',
    contactPhone: '',
    contactEmail: '',
    companyRegNumber: '',
    vatNumber: '',
    awrsNumber: '',
    directors: [
      { fullName: '', dob: '', address: '', passportFileName: '', addressProofFileName: '' }
    ],
    references: [
      { name: '', company: '', contact: '', fileName: '' },
      { name: '', company: '', contact: '', fileName: '' },
      { name: '', company: '', contact: '', fileName: '' }
    ],
    supportingDocsNames: []
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleDirectorChange = (index, field, value) => {
    setForm((f) => {
      const directors = [...f.directors];
      directors[index] = { ...directors[index], [field]: value };
      return { ...f, directors };
    });
  };

  const addDirector = () => {
    setForm((f) => ({
      ...f,
      directors: [...f.directors, { fullName: '', dob: '', address: '', passportFileName: '', addressProofFileName: '' }]
    }));
  };

  const removeDirector = (index) => {
    setForm((f) => ({
      ...f,
      directors: f.directors.filter((_, i) => i !== index)
    }));
  };

  const handleReferenceChange = (index, field, value) => {
    setForm((f) => {
      const references = [...f.references];
      references[index] = { ...references[index], [field]: value };
      return { ...f, references };
    });
  };

  const handleFileMeta = (label, files) => {
    const names = Array.from(files || []).map((f) => `${f.name} (${Math.round(f.size/1024)} KB)`);
    setForm((f) => ({ ...f, [label]: names }));
  };

  const handleDirectorFile = (dirIndex, key, files) => {
    const first = files && files[0];
    const fileName = first ? `${first.name} (${Math.round(first.size/1024)} KB)` : '';
    setForm((f) => {
      const directors = [...f.directors];
      directors[dirIndex] = { ...directors[dirIndex], [key]: fileName };
      return { ...f, directors };
    });
  };

  const handleReferenceFile = (refIndex, files) => {
    const first = files && files[0];
    const fileName = first ? `${first.name} (${Math.round(first.size/1024)} KB)` : '';
    setForm((f) => {
      const references = [...f.references];
      references[refIndex] = { ...references[refIndex], fileName };
      return { ...f, references };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Required checks
    const requiredTop = [
      form.fullName,
      form.companyName,
      form.registeredAddress,
      form.correspondingAddress,
      form.contactPhone,
      form.companyRegNumber,
      form.vatNumber,
      form.awrsNumber
    ].map((v) => String(v).trim());
    if (requiredTop.some((v) => !v)) {
      alert('Please fill all required fields.');
      return;
    }

    if (!form.directors.length || form.directors.some(d => !d.fullName || !d.address)) {
      alert('Please add director details and required documents.');
      return;
    }

    if (form.references.length < 3 || form.references.some(r => !r.name || !r.company || !r.contact)) {
      alert('Please provide 3 trade references.');
      return;
    }

    // Persist text + file names (not binary) locally
    const serializable = {
      ...form,
      // ensure we only keep file names, not binary
      directors: form.directors.map(d => ({
        fullName: d.fullName,
        dob: d.dob,
        address: d.address,
        passportFileName: d.passportFileName,
        addressProofFileName: d.addressProofFileName
      })),
      references: form.references.map(r => ({ name: r.name, company: r.company, contact: r.contact, fileName: r.fileName })),
    };

    localStorage.setItem('trade_customer_profile', JSON.stringify(serializable));
    setSaved(true);
  };

  return (
    <Layout headerContainerClass="container-fluid" headerPaddingClass="header-padding-2" headerTop="visible">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ color: '#350008', fontWeight: 800, marginBottom: 12 }}>Trade Customer Registration</h1>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Full Name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Company Name</label>
              <input name="companyName" value={form.companyName} onChange={handleChange} className="form-control" required />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Company Registered Address</label>
              <input name="registeredAddress" value={form.registeredAddress} onChange={handleChange} className="form-control" required />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Company Corresponding Address and Details</label>
              <input name="correspondingAddress" value={form.correspondingAddress} onChange={handleChange} className="form-control" required />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Contact Phone</label>
              <input name="contactPhone" value={form.contactPhone} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Contact Email</label>
              <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Company Registration Number</label>
              <input name="companyRegNumber" value={form.companyRegNumber} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">VAT Number</label>
              <input name="vatNumber" value={form.vatNumber} onChange={handleChange} className="form-control" required />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">AWRS Number</label>
              <input name="awrsNumber" value={form.awrsNumber} onChange={handleChange} className="form-control" required />
            </div>

            {/* Supporting documents */}
            <div className="col-12 mb-4">
              <label className="form-label">Supporting Documents (PDF/Images)</label>
              <input
                type="file"
                className="form-control"
                accept="image/*,application/pdf"
                multiple
                capture="environment"
                onChange={(e) => handleFileMeta('supportingDocsNames', e.target.files)}
                required
              />
              <small className="form-text text-muted">You can take photos using your camera or upload existing files.</small>
              {form.supportingDocsNames && form.supportingDocsNames.length > 0 && (
                <ul style={{ marginTop: 8 }}>
                  {form.supportingDocsNames.map((n, idx) => (
                    <li key={idx}>{n}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Directors */}
          <h4 style={{ color: '#350008', fontWeight: 800, marginTop: 20 }}>All Director Details</h4>
          {form.directors.map((d, idx) => (
            <div key={idx} className="row align-items-end" style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div className="col-md-4 mb-3">
                <label className="form-label">Director Full Name</label>
                <input value={d.fullName} onChange={(e) => handleDirectorChange(idx, 'fullName', e.target.value)} className="form-control" required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Date of Birth</label>
                <input type="date" value={d.dob} onChange={(e) => handleDirectorChange(idx, 'dob', e.target.value)} className="form-control" />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Address</label>
                <input value={d.address} onChange={(e) => handleDirectorChange(idx, 'address', e.target.value)} className="form-control" required />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Director Passport (Image/PDF)</label>
                <input type="file" className="form-control" accept="image/*,application/pdf" capture="environment" onChange={(e) => handleDirectorFile(idx, 'passportFileName', e.target.files)} required />
                {d.passportFileName && <small className="text-muted">{d.passportFileName}</small>}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Director Address Proof (Image/PDF)</label>
                <input type="file" className="form-control" accept="image/*,application/pdf" capture="environment" onChange={(e) => handleDirectorFile(idx, 'addressProofFileName', e.target.files)} required />
                {d.addressProofFileName && <small className="text-muted">{d.addressProofFileName}</small>}
              </div>
              {form.directors.length > 1 && (
                <div className="col-12 mb-2">
                  <button type="button" className="btn btn-outline-danger" onClick={() => removeDirector(idx)}>Remove Director</button>
                </div>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-outline-secondary mb-3" onClick={addDirector}>+ Add Another Director</button>

          {/* Trade References */}
          <h4 style={{ color: '#350008', fontWeight: 800, marginTop: 20 }}>3 Trade References</h4>
          {form.references.map((r, idx) => (
            <div key={idx} className="row" style={{ border: '1px dashed #ddd', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div className="col-md-4 mb-3">
                <label className="form-label">Reference Name</label>
                <input value={r.name} onChange={(e) => handleReferenceChange(idx, 'name', e.target.value)} className="form-control" required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Company</label>
                <input value={r.company} onChange={(e) => handleReferenceChange(idx, 'company', e.target.value)} className="form-control" required />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Contact (Phone/Email)</label>
                <input value={r.contact} onChange={(e) => handleReferenceChange(idx, 'contact', e.target.value)} className="form-control" required />
              </div>
              <div className="col-12 mb-2">
                <label className="form-label">Upload Reference Letter (optional)</label>
                <input type="file" className="form-control" accept="image/*,application/pdf" capture="environment" onChange={(e) => handleReferenceFile(idx, e.target.files)} />
                {r.fileName && <small className="text-muted">{r.fileName}</small>}
              </div>
            </div>
          ))}

          <button type="submit" className="btn btn-dark" style={{ background: '#350008', color: '#fffef1' }}>Save</button>
          {saved && <div style={{ color: 'green', fontWeight: 700, marginTop: 12 }}>Profile saved locally. Files are not stored; only their names are saved for your reference.</div>}
        </form>
      </div>
    </Layout>
  );
};

export default TradeCustomerForm;



