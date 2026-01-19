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


