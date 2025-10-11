import Link from "next/link";


export default function Home() {
  return (
    <>
        <div>
            <h1>Fantasy League Tracker </h1>

            <div>
                <Link href='/signup'>
                  Sign Up
                </Link>

                <Link href='/login'>
                  Login
                </Link>
            </div>
        </div>
    </>
  );
}
