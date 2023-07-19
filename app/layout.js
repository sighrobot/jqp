export const metadata = {
  title: 'jqp Playground',
  description:
    'jqp is a free serverless proxy that lets you request data from remote sources, filter it using jq-web, and receive the filtered response.',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
