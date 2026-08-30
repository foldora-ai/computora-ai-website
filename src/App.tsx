import { useState } from "react";
import { ArrowUpRight, Check, ChevronRight, Menu, X } from "lucide-react";

type Product = {
  name: string;
  eyebrow: string;
  description: string;
  detail: string;
  url: string;
  image: string;
  icon?: string;
  accent: string;
  points: string[];
};

const products: Product[] = [
  {
    name: "Foldora AI",
    eyebrow: "Files, finally in order",
    description: "A focused desktop organizer for messy folders, downloads, and everyday work.",
    detail: "Foldora analyzes supported files locally, then lets you preview proposed folders and names before anything changes.",
    url: "https://foldoraai.com",
    image: "/assets/foldora-hero.png",
    accent: "blue",
    points: ["Local file analysis", "Preview before applying", "Organize and rename files"],
  },
  {
    name: "Cleanora AI",
    eyebrow: "Clarity for cluttered folders",
    description: "An intelligent cleaner for Downloads, Desktop, Documents, and the digital spaces in between.",
    detail: "Cleanora scans locally, explains every proposed destination, and keeps an audit trail with undo for confident cleanup.",
    url: "https://cleanoraai.com",
    image: "/assets/cleanora-hero.png",
    icon: "/assets/cleanora-icon.png",
    accent: "teal",
    points: ["Exact destination previews", "Exclude anything you want", "Audit trail and undo"],
  },
  {
    name: "Galoria AI",
    eyebrow: "A calmer photo library",
    description: "A desktop photo organizer that brings structure to image collections without the busywork.",
    detail: "Galoria scans image folders locally, shows its plan first, and helps you sort with a clear, reversible workflow.",
    url: "https://galoriaai.com",
    image: "/assets/galoria-hero.png",
    icon: "/assets/galoria-icon.png",
    accent: "violet",
    points: ["Built for image folders", "Plan before moving", "Local workflow and undo"],
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(0);
  const product = products[activeProduct];

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <header className="nav-wrap">
        <nav className="nav container" aria-label="Main navigation">
          <a className="wordmark" href="#top" onClick={closeMenu} aria-label="Computora AI home">
            <span className="wordmark-mark" aria-hidden="true"><span /></span>
            <span>Computora <em>AI</em></span>
          </a>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className={`nav-links ${menuOpen ? "open" : ""}`}>
            <a href="#products" onClick={closeMenu}>Products</a>
            <a href="#about" onClick={closeMenu}>Company</a>
            <a href="#support" onClick={closeMenu}>Support</a>
            <a className="nav-cta" href="#products" onClick={closeMenu}>Explore our software <ArrowUpRight size={15} /></a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="container hero-inner">
            <div className="hero-copy reveal">
              <p className="kicker"><span className="kicker-dot" /> COMPUTORA AI / DESKTOP SOFTWARE</p>
              <h1>Intelligent software for a <span>cleaner digital world.</span></h1>
              <p className="hero-lede">Computora AI creates focused desktop applications that organize, clean, and clarify the digital work around you.</p>
              <div className="hero-actions">
                <a className="button button-light" href="#products">Explore our products <ArrowUpRight size={17} /></a>
                <a className="text-link" href="#about">How we think <ChevronRight size={16} /></a>
              </div>
            </div>
            <div className="ecosystem-orbit reveal delay-1" aria-label="The Computora AI product family">
              <div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" />
              <div className="orbit-core"><span>COMPUTORA</span><strong>AI</strong></div>
              {products.map((item, index) => (
                <button key={item.name} className={`orbit-product orbit-${index + 1}`} onClick={() => { setActiveProduct(index); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }} aria-label={`Explore ${item.name}`}>
                  {item.icon ? <img src={item.icon} alt="" /> : <span className="mini-mark">F</span>}
                  <span>{item.name.replace(" AI", "")}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="hero-foot container"><span>Built for real work</span><span>Focused desktop tools</span><span>Designed to last</span></div>
        </section>

        <section className="intro section" id="about">
          <div className="container intro-grid">
            <p className="section-label">01 / THE COMPANY</p>
            <div className="intro-copy"><h2>Software should remove friction, not add another layer.</h2><p>We build practical tools for the parts of digital life that should simply work. Each product has one clear job, a considered interface, and enough intelligence to make the next step obvious.</p></div>
          </div>
        </section>

        <section className="products section" id="products">
          <div className="container">
            <div className="section-heading"><div><p className="section-label">02 / THE PRODUCT FAMILY</p><h2>Three tools.<br /><i>One clear purpose.</i></h2></div><p className="heading-aside">Different digital spaces need different kinds of attention. Our products meet each one with calm, capable software.</p></div>
            <div className="product-tabs" role="tablist" aria-label="Products">
              {products.map((item, index) => <button key={item.name} role="tab" aria-selected={activeProduct === index} className={activeProduct === index ? "selected" : ""} onClick={() => setActiveProduct(index)}><span>0{index + 1}</span>{item.name}</button>)}
            </div>
            <div className={`product-showcase accent-${product.accent}`}>
              <div className="showcase-copy"><p className="product-eyebrow">{product.eyebrow}</p><h3>{product.name}</h3><p className="showcase-description">{product.description}</p><p className="showcase-detail">{product.detail}</p><ul>{product.points.map((point) => <li key={point}><Check size={15} /> {point}</li>)}</ul><a className="button button-dark" href={product.url} target="_blank" rel="noreferrer">Explore {product.name.replace(" AI", "")} <ArrowUpRight size={17} /></a></div>
              <div className="showcase-visual"><div className="visual-glow" /><div className="window-chrome"><span /><span /><span /></div><img src={product.image} alt={`${product.name} desktop application`} /></div>
            </div>
            <div className="product-links">{products.map((item) => <a href={item.url} target="_blank" rel="noreferrer" key={item.name}><span>{item.name}</span><ArrowUpRight size={15} /></a>)}</div>
          </div>
        </section>

        <section className="principles section" id="support">
          <div className="container principles-grid"><div><p className="section-label">03 / OUR APPROACH</p><h2>Useful AI, made quiet.</h2><p className="principles-lede">The best software earns its place by making the everyday feel lighter.</p></div><div className="principle-list"><article><span>01</span><div><h3>Built for real work</h3><p>Clear outcomes over feature lists. Every workflow starts with a problem worth solving.</p></div></article><article><span>02</span><div><h3>Simple by design</h3><p>Intelligence should make software easier to use, not give you another system to learn.</p></div></article><article><span>03</span><div><h3>Desktop-first</h3><p>Focused tools with the access and responsiveness that everyday files and photos deserve.</p></div></article><article><span>04</span><div><h3>Careful with your data</h3><p>Our products are designed around local workflows where the work can stay on your machine.</p></div></article></div></div>
        </section>

        <section className="statement section"><div className="container statement-inner"><p className="section-label">04 / THE LONG VIEW</p><blockquote>“We build focused software for the parts of digital life that should simply work.”</blockquote><p className="statement-copy">Foldora, Cleanora, and Galoria are the beginning of a broader family of intelligent desktop tools—each small enough to feel personal, and considered enough to last.</p><a className="text-link dark-link" href="#products">Meet the product family <ChevronRight size={16} /></a></div></section>

        <section className="final-cta"><div className="container final-inner"><p className="section-label">05 / START HERE</p><h2>Find the right tool<br /><i>for your digital workspace.</i></h2><a className="button button-light" href="#products">Explore our software <ArrowUpRight size={17} /></a><div className="final-products">{products.map((item) => <a href={item.url} target="_blank" rel="noreferrer" key={item.name}>{item.icon ? <img src={item.icon} alt="" /> : <span className="mini-mark">F</span>}<span>{item.name}</span><ArrowUpRight size={15} /></a>)}</div></div></section>
      </main>

      <footer className="footer"><div className="container footer-top"><a className="wordmark" href="#top"><span className="wordmark-mark" aria-hidden="true"><span /></span><span>Computora <em>AI</em></span></a><p>Intelligent desktop software<br />for a cleaner digital world.</p><div className="footer-nav"><div><p>Products</p><a href="https://foldoraai.com">Foldora AI</a><a href="https://cleanoraai.com">Cleanora AI</a><a href="https://galoriaai.com">Galoria AI</a></div><div><p>Company</p><a href="#about">About</a><a href="#support">Support</a><a href="#top">Contact</a></div></div></div><div className="container footer-bottom"><span>© 2026 Computora AI</span><span>Focused tools. Less digital clutter.</span><div><a href="#top">Privacy</a><a href="#top">Terms</a></div></div></footer>
    </div>
  );
}

export default App;
