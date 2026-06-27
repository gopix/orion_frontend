import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Editor.css";

export default function Editor() {
  const navigate = useNavigate();

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const documents = [
    {
      id: 1,
      title: "The Future of AI in Publishing",
      author: "John Doe",
      status: "In Review",
      progress: 65,
      suggestions: 12
    },
    {
      id: 2,
      title: "Digital Transformation Guide",
      author: "Jane Smith",
      status: "Editing",
      progress: 45,
      suggestions: 8
    },
    {
      id: 3,
      title: "Cloud Computing Essentials",
      author: "Mike Johnson",
      status: "Pending",
      progress: 20,
      suggestions: 15
    }
  ];

  const mockSuggestions = [
    {
      id: 1,
      type: "grammar",
      text: "This sentence is too long and should be split.",
      original: "The technology that we have developed over the years has become increasingly complex.",
      suggested: "The technology we developed has become increasingly complex.",
      location: "Page 1, Paragraph 2"
    },
    {
      id: 2,
      type: "style",
      text: "Consider using active voice instead of passive.",
      original: "The document was reviewed by the team.",
      suggested: "The team reviewed the document.",
      location: "Page 1, Paragraph 4"
    },
    {
      id: 3,
      type: "clarity",
      text: "This phrase could be clearer for better readability.",
      original: "The aforementioned implementation process",
      suggested: "This implementation process",
      location: "Page 2, Paragraph 1"
    }
  ];

  const handleDocumentSelect = (doc) => {
    setSelectedDocument(doc);
    setSuggestions(mockSuggestions);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "grammar": return "✓";
      case "style": return "🎨";
      case "clarity": return "💡";
      default: return "📝";
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case "grammar": return "#dc2626";
      case "style": return "#f97316";
      case "clarity": return "#eab308";
      default: return "#6b7280";
    }
  };

  return (
    <div className="editor-page">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="editor-sidebar">
        <div className="editor-logo">
          <div className="editor-logo-mark">O</div>
          <div className="editor-logo-text">
            <span>ORION</span>
            <small>AI-Powered Editing</small>
          </div>
        </div>

        <nav className="editor-nav">
          <p className="editor-nav-label">WORKSPACE</p>
          <div className="editor-nav-item" onClick={() => navigate("/submit")}>
            <span className="editor-nav-icon">📑</span>
            <span>Submit+</span>
          </div>
          <div className="editor-nav-item active">
            <span className="editor-nav-icon">📝</span>
            <span>Editor+</span>
            <span className="editor-nav-dot"></span>
          </div>
          <div className="editor-nav-item" onClick={() => navigate("/remediate-pdf")}>
            <span className="editor-nav-icon">🔧</span>
            <span>Accessibility</span>
          </div>
        </nav>

        <div className="editor-sidebar-footer">
          <button className="editor-help-btn">
            <span>?</span>
          </button>
          <p className="editor-help-text">Need help?</p>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="editor-main">
        <div className="editor-container">
          <div className="editor-layout">
            {/* ── Documents List ──────────────────────────────── */}
            <section className="editor-list-section">
              <div className="editor-list-header">
                <h2 className="editor-list-title">Documents</h2>
                <span className="editor-list-count">{documents.length} documents</span>
              </div>

              <div className="editor-documents-list">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`editor-doc-card ${selectedDocument?.id === doc.id ? 'active' : ''}`}
                    onClick={() => handleDocumentSelect(doc)}
                  >
                    <div className="editor-doc-header">
                      <div>
                        <h3 className="editor-doc-title">{doc.title}</h3>
                        <p className="editor-doc-author">by {doc.author}</p>
                      </div>
                      <span className={`editor-doc-status editor-status-${doc.status.toLowerCase().replace(' ', '-')}`}>
                        {doc.status}
                      </span>
                    </div>

                    <div className="editor-doc-progress">
                      <div className="editor-progress-bar">
                        <div 
                          className="editor-progress-fill" 
                          style={{ width: `${doc.progress}%` }}
                        ></div>
                      </div>
                      <span className="editor-progress-text">{doc.progress}%</span>
                    </div>

                    <div className="editor-doc-footer">
                      <span className="editor-doc-suggestions">
                        💡 {doc.suggestions} suggestions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Editor Panel ────────────────────────────────── */}
            {selectedDocument ? (
              <section className="editor-panel-section">
                <div className="editor-panel-header">
                  <div>
                    <h2 className="editor-panel-title">{selectedDocument.title}</h2>
                    <p className="editor-panel-subtitle">AI-powered editorial suggestions</p>
                  </div>
                  <button
                    className="editor-panel-close"
                    onClick={() => {
                      setSelectedDocument(null);
                      setSuggestions([]);
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="editor-suggestions-container">
                  {suggestions.length > 0 ? (
                    <>
                      <div className="editor-suggestions-header">
                        <h3 className="editor-suggestions-title">
                          Found {suggestions.length} improvement{suggestions.length !== 1 ? 's' : ''}
                        </h3>
                      </div>

                      <div className="editor-suggestions-list">
                        {suggestions.map((suggestion, idx) => (
                          <div key={idx} className="editor-suggestion-card">
                            <div className="editor-suggestion-header">
                              <span 
                                className="editor-suggestion-type"
                                style={{ backgroundColor: getTypeColor(suggestion.type) }}
                              >
                                {getTypeIcon(suggestion.type)}
                              </span>
                              <div className="editor-suggestion-info">
                                <p className="editor-suggestion-text">{suggestion.text}</p>
                                <p className="editor-suggestion-location">{suggestion.location}</p>
                              </div>
                            </div>

                            <div className="editor-suggestion-details">
                              <div className="editor-suggestion-original">
                                <label className="editor-detail-label">Original</label>
                                <div className="editor-detail-content original">
                                  {suggestion.original}
                                </div>
                              </div>

                              <div className="editor-suggestion-arrow">→</div>

                              <div className="editor-suggestion-suggested">
                                <label className="editor-detail-label">Suggested</label>
                                <div className="editor-detail-content suggested">
                                  {suggestion.suggested}
                                </div>
                              </div>
                            </div>

                            <div className="editor-suggestion-actions">
                              <button className="editor-action-accept">✓ Accept</button>
                              <button className="editor-action-reject">✕ Reject</button>
                              <button className="editor-action-edit">✎ Edit</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="editor-empty-state">
                      <p>No suggestions yet. Start editing to see improvements.</p>
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <section className="editor-empty-panel">
                <div className="editor-empty-content">
                  <div className="editor-empty-icon">📋</div>
                  <h3 className="editor-empty-title">Select a Document</h3>
                  <p className="editor-empty-desc">
                    Choose a document from the list to view AI-powered editorial suggestions
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}