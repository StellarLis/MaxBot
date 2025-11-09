import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { MaxUI } from "@maxhub/max-ui";

const Root = () => (
    <MaxUI>
        <App />
    </MaxUI>
);

createRoot(document.getElementById('root')!).render(<Root />);
