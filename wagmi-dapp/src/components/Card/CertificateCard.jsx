// Certificate Card Component
const CertificateCard = ({ certificate }) => (
  <div className="certificate-card">
    <div className="certificate-content">
      <h3>Certificate of Completion</h3>
      <h4>{certificate.course_name}</h4>
      <p>Token ID: #{certificate.tokenId}</p>
      <p>Completed: {new Date(certificate.completionDate).toLocaleDateString()}</p>
      <div style={{ marginTop: '1rem' }}>
        <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>NFT Certificate</span>
      </div>
    </div>
  </div>
);

export default CertificateCard;        