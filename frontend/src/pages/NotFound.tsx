import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-4">404</h1>
      <p className="lead">Page Not Found</p>
      <a href="/" className="btn btn-primary">
        Go Home
      </a>
    </div>
  );
};

export default NotFound;
