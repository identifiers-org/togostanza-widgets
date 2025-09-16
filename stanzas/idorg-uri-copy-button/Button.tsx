import React, { useCallback, useEffect, useState } from "react";

export interface ButtonProps {
    urlOverwrite: string
    uriPreload: boolean
    buttonIcon: boolean
    buttonClasses: string
    buttonLabel: string
    flashDuration: number,
    cssAdditionalStylesheetUrls: string
}

export default (props: ButtonProps) => {
    const {
        urlOverwrite, 
        uriPreload, 
        buttonIcon, 
        buttonClasses, 
        buttonLabel, 
        flashDuration,
    } = props;
    
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(false);
    const [savedUri, setSavedUri] = useState<string|undefined>(undefined);
    const [flashingText, setFlashingText] = useState<string|undefined>(undefined);

    //// URI loading function ////////////////
    const onClick = useCallback(async () => {
        if (savedUri !== undefined) {
            navigator.clipboard.writeText(savedUri);
            setFlashingText('Copied to clipboard!');
        } else {
            const href = urlOverwrite || window.location.href;
            if (!href) return;
            const uri = await loadUri(href);
            await navigator.clipboard.writeText(uri);
            setFlashingText('Copied to clipboard!');
        }
    }, [urlOverwrite, savedUri]);

    //// URI loading function ////////////////
    const loadUri = useCallback(async (href: string) => {
        setLoading(true);
        const requestInit: RequestInit = {
            method: "POST",
            body: JSON.stringify({
                apiVersion: "1.0",
                payload: {
                    url: href
                }
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }
        return await fetch("https://resolver.api.identifiers.org/reverse/byPrefix", requestInit)
            .then(async response => { // on fetch fulfilled
                let uri = null;
                if (response.status === 200) {
                    uri = await response.json().then(json => json.payload.possible_idorg_url)
                    await navigator.clipboard.writeText(uri);
                    setFailed(false);
                    setSavedUri(uri);
                } else {
                    console.debug(`Got ${response.status} response`, response)
                    setFailed(true);
                    setSavedUri(undefined);
                }
                setLoading(false);
                return uri;
            }, (reason) => { // on fetch reject
                setLoading(false); 
                setFailed(true);
                setSavedUri(undefined);
                console.error(reason);
            });
    }, []);


    //// Preload effect ////////////////
    useEffect(() => {
        if (uriPreload && savedUri === undefined) {
            const href = urlOverwrite || window.location.href;
            if (!href) return;
            loadUri(href);
        }
    }, [uriPreload, loadUri, savedUri])

    //// Flashing text effect ////////////////
    useEffect(() => {
        if (flashingText !== undefined) {
            setTimeout(() => {
                setFlashingText(undefined);
            }, flashDuration);
        }
    }, [flashingText, flashDuration]);


    //// Render ////////////////
    if (!failed) {
        return <button type="button" onClick={onClick} disabled={loading} className={buttonClasses}>
            {loading ? 'Loading...' : <>
                {flashingText !== undefined ? flashingText : buttonLabel}
                {buttonIcon && <img src="https://raw.githubusercontent.com/identifiers-org/monorepo/refs/heads/master/logo.svg" 
                     alt="identifiers.org logo" className="idorg-logo ms-2" />}
            </>}
        </button>
    }
};