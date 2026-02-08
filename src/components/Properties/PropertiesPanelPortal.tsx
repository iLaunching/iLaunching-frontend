import { createPortal } from 'react-dom';
import React from 'react';

interface PropertiesPanelPortalProps {
    children: React.ReactNode;
}

/**
 * Portal wrapper to render the properties panel at the root of the DOM
 * This prevents z-index and overflow issues within the canvas
 */
export const PropertiesPanelPortal: React.FC<PropertiesPanelPortalProps> = ({ children }) => {
    return createPortal(children, document.body);
};

export default PropertiesPanelPortal;
