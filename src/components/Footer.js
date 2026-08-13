import Link from "next/link";
import { Mail, Phone, MapPin, Globe, ArrowUpRight } from "lucide-react";

const Facebook = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

const Twitter = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
);

const Linkedin = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);

const Instagram = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);

export default function Footer() {
  return (
    <footer className="footer" style={{
      background: 'linear-gradient(180deg, #0F172A 0%, #020617 100%)',
      color: '#94A3B8',
      padding: '100px 0 40px 0',
      borderTop: '1px solid #1E293B',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Blob */}
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        right: '-100px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.05), transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }}></div>

      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <Link href="/" style={{ display: "inline-flex", marginTop: "-62px", marginBottom: "24px" }}>
              <img
                src="/logo-footer.png"
                alt="Franchise Roots"
                style={{ height: '185px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#94A3B8', maxWidth: '340px', marginTop: '0px' }}>
              Franchise Roots is the premier startup and business matching marketplace. We connect luxury brands with verified investors across the subcontinent.
            </p>

            {/* Social Share / Links */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '28px' }}>
              {[
                { icon: <Facebook size={16} />, url: 'https://facebook.com' },
                { icon: <Twitter size={16} />, url: 'https://twitter.com' },
                { icon: <Linkedin size={16} />, url: 'https://linkedin.com' },
                { icon: <Instagram size={16} />, url: 'https://instagram.com' }
              ].map((soc, idx) => (
                <a
                  key={idx}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-center"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94A3B8',
                    transition: 'var(--transition-normal)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#94A3B8';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px' }}>Popular Categories</h4>
            <ul className="footer-links" style={{ listStyle: 'none' }}>
              {[
                { name: 'Food & Beverage', url: '/brands/?category=Food and Beverage' },
                { name: 'Retail Directory', url: '/brands/?category=Retail' },
                { name: 'Educational Centers', url: '/brands/?category=Education' },
                { name: 'Automobiles & EV', url: '/brands/?category=Automobiles' },
                { name: 'Health & Wellness', url: '/brands/?category=Health and Wellness' }
              ].map((link, idx) => (
                <li key={idx} style={{ marginBottom: '12px' }}>
                  <Link href={link.url} style={{ fontSize: '13.5px', color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: '4px' }} className="footer-link-hover">
                    {link.name} <ArrowUpRight size={10} style={{ opacity: 0, transition: 'var(--transition-fast)' }} className="link-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px' }}>Quick Links</h4>
            <ul className="footer-links" style={{ listStyle: 'none' }}>
              {[
                { name: 'Homepage Directory', url: '/' },
                { name: 'Franchise Brands Catalog', url: '/brands' },
                { name: 'Latest Blog Articles', url: '/blogs' },
                { name: 'Register Your Brand', url: '/brand-registration' },
                { name: 'Start New Business', url: '/investor-registration' },
                { name: 'Contact Consulting Desk', url: '/contact' },
                { name: 'Partner Login Area', url: '/login' },
                { name: 'Admin Verification Panel', url: '/admin' }
              ].map((link, idx) => (
                <li key={idx} style={{ marginBottom: '12px' }}>
                  <Link href={link.url} style={{ fontSize: '13.5px', color: '#94A3B8', display: 'inline-flex', alignItems: 'center', gap: '4px' }} className="footer-link-hover">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-contact">
            <h4 style={{ color: 'white', fontSize: '13px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '24px' }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p className="contact-item">
                <Phone size={19} className="contact-icon" />
                <span>+91-9815489999</span>
              </p>
              <p className="contact-item">
                <Mail size={19} className="contact-icon" />
                <span>info@franchiseroots.com</span>
              </p>
              <p className="contact-item">
                <MapPin size={19} className="contact-icon" />
                <span>SCO 64-65, 4th Floor, Sub. City Center, Sector 34A, Chandigarh</span>
              </p>
              <p className="contact-item">
                <Globe size={19} className="contact-icon" />
                <span>www.franchiseroots.com</span>
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{
          borderTop: '1px solid #1E293B',
          paddingTop: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '13px'
        }}>
          <p>© 2009 - 2026 Franchise Roots. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/terms" style={{ transition: 'var(--transition-normal)' }} className="footer-bottom-link">Terms & Conditions</Link>
            <Link href="/privacy" style={{ transition: 'var(--transition-normal)' }} className="footer-bottom-link">Privacy Policy</Link>
            <Link href="/contact" style={{ transition: 'var(--transition-normal)' }} className="footer-bottom-link">Contact Us</Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .footer-link-hover:hover .link-arrow {
          opacity: 1;
          transform: translate(1px, -1px);
        }
        .footer-bottom-link:hover {
          color: white;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 13px;
          font-size: 13.5px;
          line-height: 1.5;
          color: #94A3B8;
          transition: color 0.3s ease;
        }
        .contact-item:hover {
          color: #FFFFFF;
        }
        .contact-icon {
          color: #FFFFFF !important;
          flex-shrink: 0;
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .contact-item:hover .contact-icon {
          filter: drop-shadow(0 0 6px var(--secondary));
          transform: scale(1.08);
        }
      `}</style>
    </footer>
  );
}