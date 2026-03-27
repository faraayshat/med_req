import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <span className="font-bold text-2xl text-blue-600">HealthMed</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Login
          </Link>
          <Link href="/signup" className="text-sm font-medium hover:underline underline-offset-4">
            Sign Up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-blue-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-blue-900 border-none">
                  Your Personal Health Assistant
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-700 md:text-xl border-none">
                  Securely manage your health records, track your symptoms, and get personalized guidance on your well-being.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700 disabled:pointer-events-none disabled:opacity-50"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-blue-600 bg-white px-8 text-sm font-medium text-blue-600 shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-black border-none">Secure Record Keeping</h3>
                <p className="text-gray-600 border-none">
                  Upload your prescriptions and test reports securely to keep everything in one place.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-black border-none">Personalized Guidance</h3>
                <p className="text-gray-600 border-none">
                  Receive basic recommendations for common health concerns based on your symptoms.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-black border-none">Simple Health Tracking</h3>
                <p className="text-gray-600 border-none">
                  Monitor your BMI and other health metrics over time with our simple tracking tools.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t font-medium text-black">
        <p className="text-xs text-gray-600">© 2026 HealthMed Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
