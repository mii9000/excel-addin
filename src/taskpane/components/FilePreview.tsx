import * as React from 'react';
import { 
    Dialog, 
    DialogType, 
    DialogFooter,
    PrimaryButton,
    DefaultButton,
    Link,
    Stack,
    Text,
    IStackTokens,
    Icon,
    MessageBar,
    MessageBarType
} from '@fluentui/react';
import { ProcessedFile } from '../models/types';
import * as Tesseract from 'tesseract.js';

export interface FilePreviewProps {
    file: ProcessedFile | null;
    isOpen: boolean;
    onDismiss: () => void;
}

const stackTokens: IStackTokens = { childrenGap: 10 };

const FilePreview: React.FC<FilePreviewProps> = (props) => {
    const { file, isOpen, onDismiss } = props;
    const [dataUrl, setDataUrl] = React.useState<string | null>(null);
    const [previewError, setPreviewError] = React.useState<string | null>(null);
    
    // States for snipping functionality
    const [isSelecting, setIsSelecting] = React.useState<boolean>(false);
    const [selectionStart, setSelectionStart] = React.useState<{ x: number, y: number } | null>(null);
    const [selectionEnd, setSelectionEnd] = React.useState<{ x: number, y: number } | null>(null);
    const [selection, setSelection] = React.useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const [extractedText, setExtractedText] = React.useState<string | null>(null);
    const [isExtracting, setIsExtracting] = React.useState<boolean>(false);
    const [showText, setShowText] = React.useState<boolean>(false);
    
    // Reference for image element
    const imageRef = React.useRef<HTMLImageElement>(null);
    // Reference for the selection canvas
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    // Define resetSelection function using useCallback to ensure it's available during initialization
    const resetSelection = React.useCallback(() => {
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
        setSelection(null);
        setExtractedText(null);
        setIsExtracting(false);
        setShowText(false);
        
        // Clear canvas
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, []);

    React.useEffect(() => {
        if (file && file.fileData) {
            setDataUrl(file.fileData);
            setPreviewError(null);
            
            // Reset selection states when file changes
            resetSelection();
        } else if (file) {
            setPreviewError("Preview is not available for this file.");
            setDataUrl(null);
        }
    }, [file, resetSelection]);
    
    // Reset selection when dialog closes
    React.useEffect(() => {
        if (!isOpen) {
            resetSelection();
        }
    }, [isOpen, resetSelection]);
    
    // Draw selection rectangle on canvas when selection changes
    React.useEffect(() => {
        if (canvasRef.current && selectionStart && selectionEnd) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
                // Clear previous drawings
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Calculate selection rectangle
                const x = Math.min(selectionStart.x, selectionEnd.x);
                const y = Math.min(selectionStart.y, selectionEnd.y);
                const width = Math.abs(selectionEnd.x - selectionStart.x);
                const height = Math.abs(selectionEnd.y - selectionStart.y);
                
                // Draw selection rectangle
                ctx.strokeStyle = '#00a2ed';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);
                
                // Set selection for extraction
                setSelection({ x, y, width, height });
            }
        }
    }, [selectionStart, selectionEnd]);

    if (!file) {
        return null;
    }

    const dialogContentProps = {
        type: DialogType.normal,
        title: `Preview: ${file.name}`,
        closeButtonAriaLabel: 'Close',
        subText: `File type: ${file.type}, Size: ${formatFileSize(file.size)}`
    };

    // Format file size for display
    function formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    // Mouse event handlers for selection
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isSelecting) return;
        
        // Get canvas position
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        // Calculate mouse position relative to canvas
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setSelectionStart({ x, y });
        setSelectionEnd({ x, y });
    };
    
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isSelecting || !selectionStart) return;
        
        // Get canvas position
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        // Calculate mouse position relative to canvas
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setSelectionEnd({ x, y });
    };
    
    const handleMouseUp = () => {
        if (!isSelecting || !selectionStart || !selectionEnd) return;
        
        // If selection is too small, reset it
        const width = Math.abs(selectionEnd.x - selectionStart.x);
        const height = Math.abs(selectionEnd.y - selectionStart.y);
        
        if (width < 10 || height < 10) {
            resetSelection();
            return;
        }
        
        setIsSelecting(false);
    };
    
    // Extract text from selected region
    const extractTextFromRegion = async () => {
        if (!selection || !imageRef.current || !dataUrl) return;
        
        try {
            setIsExtracting(true);
            
            // Create a temporary canvas for the selected region
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = selection.width;
            tempCanvas.height = selection.height;
            
            const ctx = tempCanvas.getContext('2d');
            if (!ctx) throw new Error('Failed to get canvas context');
            
            // Draw only the selected region of the image to the canvas
            ctx.drawImage(
                imageRef.current,
                selection.x, selection.y, selection.width, selection.height, // Source coordinates
                0, 0, selection.width, selection.height // Destination coordinates
            );
            
            // Get data URL from temp canvas
            const regionDataUrl = tempCanvas.toDataURL();
            
            // Use Tesseract to perform OCR on the selected region
            const result = await Tesseract.recognize(
                regionDataUrl,
                'eng',
                { 
                    logger: m => console.log('OCR Progress:', m)
                }
            );
            
            // Set extracted text
            setExtractedText(result.data.text);
            console.log('Extracted Text:', result.data.text);
            
            // Show text
            setShowText(true);
        } catch (error) {
            console.error('Error extracting text:', error);
            setExtractedText('Error extracting text. Please try again.');
        } finally {
            setIsExtracting(false);
        }
    };
    
    // Toggle selection mode
    const toggleSelectionMode = () => {
        if (isSelecting) {
            resetSelection();
        } else {
            setIsSelecting(true);
            setSelectionStart(null);
            setSelectionEnd(null);
            setSelection(null);
            setExtractedText(null);
            setShowText(false);
        }
    };

    // Determine if file is an image type
    const isImage = file.type.includes('image');
    // Determine if file is a PDF
    const isPdf = file.type.includes('pdf');

    const containerStyle: React.CSSProperties = {
        minWidth: '800px',
        minHeight: '400px',
        width: '100%',
        height: '70vh',
        overflow: 'auto',
        border: '1px solid #f3f2f1',
        borderRadius: '2px',
        backgroundColor: '#ffffff',
        position: 'relative'
    };
    
    // Canvas overlay style
    const canvasStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: isSelecting ? 'auto' : 'none',
        cursor: isSelecting ? 'crosshair' : 'default',
        zIndex: 2
    };

    return (
        <Dialog
            hidden={!isOpen}
            onDismiss={onDismiss}
            dialogContentProps={dialogContentProps}
            modalProps={{
                isBlocking: false,
                styles: { 
                    main: { 
                        minWidth: '850px',  // Extra space for borders and padding
                        minHeight: '500px', // Extra space for header and footer
                        maxWidth: '95vw',
                        maxHeight: '95vh',
                        width: 'auto'
                    },
                    scrollableContent: {
                        minHeight: '450px'
                    }
                }
            }}
        >
            <div style={{ padding: '0px', margin: '0 0 20px 0' }}>
                {previewError && (
                    <Text style={{ color: 'red', padding: '20px' }}>{previewError}</Text>
                )}
                
                {showText && extractedText && (
                    <MessageBar
                        messageBarType={MessageBarType.info}
                        isMultiline={true}
                        dismissButtonAriaLabel="Close"
                        onDismiss={() => setShowText(false)}
                        style={{ marginBottom: '10px' }}
                    >
                        <Text variant="medium">Extracted Text:</Text>
                        <pre style={{ 
                            maxHeight: '100px', 
                            overflow: 'auto', 
                            backgroundColor: '#f8f8f8', 
                            padding: '8px',
                            marginTop: '5px',
                            borderRadius: '2px',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            {extractedText}
                        </pre>
                    </MessageBar>
                )}

                {!previewError && (
                    <>
                        {/* Image Preview with selection capability */}
                        {isImage && dataUrl && (
                            <div style={containerStyle}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'flex-start',
                                    minHeight: '100%',
                                    position: 'relative'
                                }}>
                                    <img
                                        ref={imageRef}
                                        src={dataUrl}
                                        alt={file.name}
                                        style={{
                                            maxWidth: 'none', // Allow original size
                                            margin: '0 auto'
                                        }}
                                        onLoad={(e) => {
                                            if (canvasRef.current && imageRef.current) {
                                                // Set canvas dimensions to match image
                                                canvasRef.current.width = imageRef.current.clientWidth;
                                                canvasRef.current.height = imageRef.current.clientHeight;
                                            }
                                        }}
                                    />
                                    <canvas 
                                        ref={canvasRef}
                                        style={canvasStyle}
                                        onMouseDown={handleMouseDown}
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
                                    />
                                </div>
                            </div>
                        )}

                        {/* PDF Preview */}
                        {isPdf && dataUrl && (
                            <div style={containerStyle}>
                                <object
                                    data={dataUrl}
                                    type="application/pdf"
                                    width="100%"
                                    height="100%"
                                >
                                    <Text>
                                        Your browser does not support PDF preview.{' '}
                                        <Link href={dataUrl} target="_blank">Open PDF</Link>
                                    </Text>
                                </object>
                            </div>
                        )}

                        {/* Fallback for other file types or when no preview is available */}
                        {!isImage && !isPdf && (
                            <div style={{
                                ...containerStyle,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '20px'
                            }}>
                                <Icon iconName={
                                    file.type.includes('document') ? 'Document' :
                                    file.type.includes('text') ? 'TextDocument' :
                                    'Page'
                                } style={{ fontSize: '72px', marginBottom: '20px' }} />
                                <Text variant="large">This file type cannot be previewed directly.</Text>
                                {file.status === 'processed' && (
                                    <Text style={{ marginTop: '10px' }}>
                                        The content has been processed with OCR and is searchable.
                                    </Text>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <DialogFooter>
                {isImage && (
                    <>
                        <DefaultButton 
                            onClick={toggleSelectionMode} 
                            text={isSelecting ? "Cancel Selection" : "Select Region"}
                            iconProps={{ iconName: 'Crop' }}
                            disabled={isExtracting}
                        />
                        <DefaultButton 
                            onClick={extractTextFromRegion} 
                            text="Extract Text"
                            iconProps={{ iconName: 'TextDocument' }}
                            disabled={!selection || isExtracting}
                        />
                    </>
                )}
                <PrimaryButton onClick={onDismiss} text="Close" />
            </DialogFooter>
        </Dialog>
    );
};

export default FilePreview; 