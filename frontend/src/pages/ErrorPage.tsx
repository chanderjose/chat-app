import { useRouteError, Link, isRouteErrorResponse } from 'react-router-dom';

export default function ErrorPage() {
    const error = useRouteError();

    const status = isRouteErrorResponse(error) ? error.status : 'Error';
    const statusText = isRouteErrorResponse(error)
        ? error.statusText
        : error instanceof Error
        ? error.message
        : 'An unexpected error occurred';

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-800">{status}</h1>
                <p className="text-2xl font-light text-gray-600 mt-4">Oops! {statusText}</p>

                <div className="mt-6">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-primary/80 focus:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
                    >
                        Go back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
