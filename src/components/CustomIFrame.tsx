import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';

export type CustomIFrameProps = {
  url: string;
};

export const CustomIFrame = (props: CustomIFrameProps) => {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const url = props.url;

  useEffect(() => {
    if (!url) {
      setError(new Error('Invalid URL'));
      return;
    }

    fetch(url, { method: 'GET' })
      .then(async (res) => {
        if (res.ok) {
          setHtml(await res.text());
        } else {
          setError(new Error(res.statusText));
        }
      })
      .catch((err) => {
        setError(err);
      });
  }, [url]);

  if (!html || error) {
    return (
      <Typography
        variant="h5"
        component="div"
        sx={{ textAlign: 'center', bgcolor: 'white', textColor: 'black' }}
      >
        {error?.message}
        <br />
      </Typography>
    );
  }

  return (
    <div
      className="content"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    ></div>
  );
};
