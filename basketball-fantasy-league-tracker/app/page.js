import Link from "next/link";


export default function Home() {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <h1 className="page-title">
          Fantasy League Tracker
        </h1>
        
        <p className="page-subtitle">
          Welcome to your fantasy basketball league!
        </p>
        
        <div className="button-group">
          <Link href="/signup" className="btn btn-primary">
            Sign Up
          </Link>
          
          <Link href="/login" className="btn btn-secondary">
            Login
          </Link>
        </div>
      </div>
      
      <div className="footer">
        Track your team. Dominate your league.
      </div>
    </div>
  );
}
