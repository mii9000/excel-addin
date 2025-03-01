import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
    Stack, 
    Text, 
    PrimaryButton, 
    TextField, 
    SearchBox, 
    IStackTokens, 
    MessageBar,
    MessageBarType,
    Spinner,
    SpinnerSize,
    Icon
} from '@fluentui/react';
import * as Tesseract from 'tesseract.js';
import FileList from './FileList';
import SearchResults from './SearchResults';
import { ProcessedFile, SearchResult, SearchMatch } from '../models/types';

// Define component styling
const stackTokens: IStackTokens = { childrenGap: 15 };

const App: React.FC = () => {
    // State for managing files and search
    const [files, setFiles] = useState<ProcessedFile[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    // Clear status messages after a delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setErrorMessage('');
            setSuccessMessage('');
        }, 5000);

        return () => clearTimeout(timer);
    }, [errorMessage, successMessage]);

    // Handle file import button click
    const handleImportFiles = async () => {
        try {
            // Create a file input element
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.accept = '.pdf,.png,.jpg,.jpeg,.tiff,.tif';
            
            // Handle file selection
            input.onchange = async (event) => {
                const target = event.target as HTMLInputElement;
                if (!target.files || target.files.length === 0) return;
                
                const newFiles: ProcessedFile[] = [];
                
                // Process each selected file
                for (let i = 0; i < target.files.length; i++) {
                    const file = target.files[i];
                    const fileId = `file-${Date.now()}-${i}`;
                    
                    // Create a new processed file object
                    const newFile: ProcessedFile = {
                        id: fileId,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        dateAdded: new Date(),
                        status: 'processing'
                    };
                    
                    newFiles.push(newFile);
                    
                    // Start OCR processing
                    processFileWithOCR(file, fileId);
                }
                
                setFiles(prevFiles => [...prevFiles, ...newFiles]);
                setSuccessMessage(`Importing ${newFiles.length} file(s)...`);
            };
            
            // Trigger the file input dialog
            input.click();
        } catch (error) {
            console.error('Error importing files:', error);
            setErrorMessage('Error importing files. Please try again.');
        }
    };

    // Process file with OCR
    const processFileWithOCR = async (file: File, fileId: string) => {
        try {
            // Get a data URL from the file
            const fileReader = new FileReader();
            fileReader.onload = async () => {
                try {
                    const dataUrl = fileReader.result as string;
                    
                    // Run OCR on the file
                    const result = await Tesseract.recognize(
                        dataUrl,
                        'eng',
                        { 
                            logger: m => console.log(m)
                        }
                    );
                    
                    // Update the file with OCR results
                    setFiles(prevFiles => 
                        prevFiles.map(f => 
                            f.id === fileId ? 
                            { 
                                ...f, 
                                status: 'processed', 
                                text: result.data.text,
                                textContent: result.data.text
                            } : f
                        )
                    );
                    
                    setSuccessMessage(`Processed ${file.name} successfully!`);
                } catch (error) {
                    console.error('OCR processing error:', error);
                    
                    // Update file with error status
                    setFiles(prevFiles => 
                        prevFiles.map(f => 
                            f.id === fileId ? { ...f, status: 'error' } : f
                        )
                    );
                    
                    setErrorMessage(`Error processing ${file.name}. Please try again.`);
                }
            };
            
            fileReader.readAsDataURL(file);
        } catch (error) {
            console.error('Error processing file:', error);
            
            // Update file with error status
            setFiles(prevFiles => 
                prevFiles.map(f => 
                    f.id === fileId ? { ...f, status: 'error' } : f
                )
            );
            
            setErrorMessage(`Error processing ${file.name}. Please try again.`);
        }
    };

    // Handle search query change
    const handleSearchChange = (ev?: React.ChangeEvent<HTMLInputElement>, newValue?: string) => {
        if (newValue !== undefined) {
            setSearchQuery(newValue);
        }
    };

    // Execute search on files
    const executeSearch = () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        
        setIsSearching(true);
        
        try {
            const results: SearchResult[] = [];
            const query = searchQuery.toLowerCase();
            
            // Search through all processed files
            files.forEach(file => {
                if (file.status === 'processed' && file.textContent) {
                    const text = file.textContent.toLowerCase();
                    const matches: SearchMatch[] = [];
                    
                    // Find all occurrences of the search query
                    let position = text.indexOf(query);
                    while (position !== -1) {
                        // Get a context snippet around the match
                        const contextStart = Math.max(0, position - 50);
                        const contextEnd = Math.min(text.length, position + query.length + 50);
                        const context = file.textContent.substring(contextStart, contextEnd);
                        
                        matches.push({
                            text: file.textContent.substring(position, position + query.length),
                            position,
                            context
                        });
                        
                        position = text.indexOf(query, position + 1);
                    }
                    
                    // Add to results if matches found
                    if (matches.length > 0) {
                        results.push({
                            fileId: file.id,
                            fileName: file.name,
                            matches
                        });
                    }
                }
            });
            
            setSearchResults(results);
            setSuccessMessage(
                results.length > 0 
                ? `Found matches in ${results.length} file(s)` 
                : 'No matches found'
            );
        } catch (error) {
            console.error('Search error:', error);
            setErrorMessage('Error searching files. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    // Handle file removal
    const handleRemoveFile = (fileId: string) => {
        setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
        setSearchResults(prevResults => prevResults.filter(r => r.fileId !== fileId));
        setSuccessMessage('File removed successfully');
    };

    return (
        <div className="ms-welcome">
            <div className="ms-welcome__header">
                <h2>OCR Document Scanner</h2>
            </div>
            
            <div className="ms-welcome__main">
                <Stack tokens={stackTokens}>
                    {/* Status messages */}
                    {errorMessage && (
                        <MessageBar
                            messageBarType={MessageBarType.error}
                            onDismiss={() => setErrorMessage('')}
                            dismissButtonAriaLabel="Close"
                        >
                            {errorMessage}
                        </MessageBar>
                    )}
                    
                    {successMessage && (
                        <MessageBar
                            messageBarType={MessageBarType.success}
                            onDismiss={() => setSuccessMessage('')}
                            dismissButtonAriaLabel="Close"
                        >
                            {successMessage}
                        </MessageBar>
                    )}
                    
                    {/* Import button */}
                    <PrimaryButton 
                        onClick={handleImportFiles}
                        iconProps={{ iconName: 'Upload' }}
                    >
                        Import Files
                    </PrimaryButton>
                    
                    {/* File list section */}
                    {files.length > 0 && (
                        <div className="file-list">
                            <Text variant="mediumPlus">Imported Files ({files.length})</Text>
                            <FileList 
                                files={files} 
                                onRemoveFile={handleRemoveFile} 
                            />
                        </div>
                    )}
                    
                    {/* Search section */}
                    <Stack horizontal tokens={stackTokens}>
                        <SearchBox
                            placeholder="Search extracted text..."
                            onChange={handleSearchChange}
                            onSearch={executeSearch}
                            value={searchQuery}
                            disabled={files.length === 0}
                            styles={{ root: { width: '100%' } }}
                        />
                        <PrimaryButton 
                            onClick={executeSearch}
                            disabled={!searchQuery.trim() || files.length === 0}
                            iconProps={{ iconName: 'Search' }}
                        >
                            Search
                        </PrimaryButton>
                    </Stack>
                    
                    {/* Search results */}
                    {isSearching ? (
                        <Stack horizontalAlign="center">
                            <Spinner size={SpinnerSize.large} label="Searching..." />
                        </Stack>
                    ) : (
                        searchResults.length > 0 && (
                            <div className="search-results">
                                <Text variant="mediumPlus">
                                    Search Results
                                </Text>
                                <SearchResults 
                                    results={searchResults} 
                                    searchQuery={searchQuery} 
                                />
                            </div>
                        )
                    )}
                </Stack>
            </div>
        </div>
    );
};

export default App; 