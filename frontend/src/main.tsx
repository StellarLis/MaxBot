import { createRoot } from 'react-dom/client'
import App from './App.tsx'

const Root = () => (
    <App />
);

createRoot(document.getElementById('root')!).render(<Root />);
