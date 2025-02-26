function Footer() {
    return (
      <footer className="w-full text-center py-6 mt-12 bg-muted">
        <p className="text-sm text-muted-foreground">
          Built with hope, sarcasm, and a slightly confused AI.  
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          If these metrics made you laugh or cry, our job here is done.  
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          © {new Date().getFullYear()} – We take no responsibility for AI hallucinations.
        </p>
      </footer>
    );
  }
  
  export default Footer;
  