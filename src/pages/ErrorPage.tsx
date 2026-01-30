/**
 * ErrorPage component - displays error information when routes fail.
 * 
 * Data sources:
 * - useRouteError: From react-router-dom (error information)
 * 
 * Results:
 * - Returns: JSX (error page with error message and link to home)
 * 
 * Uses:
 * - react-router-dom (isRouteErrorResponse, useRouteError, Link)
 * 
 * Used by:
 * - Router.tsx - as errorElement for route error handling
 */

import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

export const ErrorPage = () => {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Ett fel uppstod";

  const message = isRouteErrorResponse(error)
    ? error.data?.message ?? "Sidan kunde inte visas."
    : "Något gick fel. Försök igen eller gå tillbaka till SåSmarts startsida.";

  return (
    <main>
      <h1>{title}</h1>
      <p>{message}</p>
      <Link to="/">Till SåSmarts startsida</Link>
    </main>
  );
};


