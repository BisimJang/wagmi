// Message Component
const Message = ({ message, type = 'info', onClose }) => (
  <div className={`message ${type}`}>
    {message}
    {onClose && (
      <button 
        onClick={onClose}
        style={{ background: 'none', border: 'none', color: 'inherit', float: 'right', cursor: 'pointer' }}
      >
        ×
      </button>
    )}
  </div>
);

export default Message;