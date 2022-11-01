import { Link } from "@remix-run/react";

export default function HomePage() {    
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div
        className="hero min-h-screen"
        style={{ backgroundImage: `url("/images/ggp-aerial.jpg")` }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
            <p className="mb-5">
              Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
              excepturi exercitationem quasi. In deleniti eaque aut repudiandae
              et a id nisi.
            </p>
            <Link to="/admin/layers">
              <button className="btn btn-primary">Manage Layer</button>
            </Link>            
          </div>
        </div>
      </div>
    </div>
  );
}
