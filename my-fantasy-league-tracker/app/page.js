export default function Home() {
  return (
    <div style={{ padding: '50px' }}>
      <h1>Fantasy League Tracker</h1>
      <p>Welcome to your fantasy basketball league!</p>
      
      <div>
        <a href="/signup" style={{ marginRight: '20px' }}>Sign Up</a>
        <a href="/login">Login</a>
      </div>
    </div>
  )
}