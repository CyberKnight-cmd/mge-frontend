import Link from 'next/link';

const footerLinks = {
  Platform: [
    { label: 'Global Catalog',   href: '/catalog'    },
    { label: 'Seller Dashboard', href: '/dashboard'  },
    { label: 'Register',         href: '/register'   },
    { label: 'Sign In',          href: '/login'      },
  ],
  Company: [
    { label: 'About Us',   href: '/about'           },
    { label: 'Reviews',    href: '/reviews'         },
    { label: 'Contact',    href: '/about#contact'   },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-primary-container text-on-primary border-t border-white/10">
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <span className="text-headline-sm font-bold text-on-primary block mb-4">
            Mayank Global Exports
          </span>
          <p className="text-body-sm text-on-primary-container leading-relaxed mb-4">
            The premier B2B marketplace for catalytic converter recycling and precious metal exchange. Search by OEM code. Trade on real Pt, Pd, Rh data.
          </p>
          <div className="text-label-caps text-on-primary-container">Est. 1994 · New Delhi, India</div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section}>
            <h5 className="text-label-caps font-label-caps text-on-primary mb-5">{section.toUpperCase()}</h5>
            <ul className="space-y-3">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-body-sm text-on-primary-container hover:text-on-primary transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-body-sm text-on-primary-container">
          © {new Date().getFullYear()} Mayank Global Exports. All rights reserved.
        </p>
        <div className="flex gap-8 text-label-caps text-on-primary-container">
          <Link href="/privacy" className="hover:text-on-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-on-primary transition-colors">Terms</Link>
          <Link href="/terms#liability" className="hover:text-on-primary transition-colors">Legal</Link>
        </div>
      </div>
    </footer>
  );
}
