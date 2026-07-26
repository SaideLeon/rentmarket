import React from 'react';
import { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>{statusCode ? `Erro ${statusCode}` : 'Ocorreu um erro'}</h1>
      <p>Lamentamos o inconveniente. Por favor regresse à página inicial do Mercado Quelimane.</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
