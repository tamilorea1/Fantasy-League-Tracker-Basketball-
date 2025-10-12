import Link from "next/link";


export default function Home() {
  return (
    <>
        <div style={{ padding: '50px' }}>
      <h1>Fantasy League Tracker</h1>
      <p>Welcome to your fantasy basketball league!</p>
      
      <div>
        <Link href="/signup" style={{ marginRight: '20px' }}>Sign Up</Link>
        <Link href="/login">Login</Link>
      </div>
    </div>
    </>
  );
}
