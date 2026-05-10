export function ThemeScript() {
  const src = `(function(){try{var t=localStorage.getItem("nt-theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: src }} />;
}
