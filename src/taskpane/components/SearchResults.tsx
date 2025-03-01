import * as React from 'react';
import {
    List,
    Text,
    Stack,
    DocumentCard,
    DocumentCardTitle,
    DocumentCardDetails,
    IStackTokens
} from '@fluentui/react';
import { SearchResult } from '../models/types';

export interface SearchResultsProps {
    results: SearchResult[];
    searchQuery: string;
}

// Styling
const stackTokens: IStackTokens = { childrenGap: 8 };

const SearchResults: React.FC<SearchResultsProps> = (props) => {
    const { results, searchQuery } = props;

    // Highlight matching text in search results
    const highlightMatch = (text: string, query: string): JSX.Element => {
        if (!query) return <span>{text}</span>;
        
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        
        return (
            <span>
                {parts.map((part, index) => 
                    part.toLowerCase() === query.toLowerCase() ? 
                        <span key={index} className="highlight">{part}</span> : 
                        <span key={index}>{part}</span>
                )}
            </span>
        );
    };

    // Render each result item
    const renderResultItem = (result: SearchResult): JSX.Element => {
        return (
            <DocumentCard key={result.fileId} style={{ marginBottom: 10 }}>
                <DocumentCardTitle title={result.fileName} />
                <DocumentCardDetails>
                    <Stack tokens={stackTokens}>
                        <Text variant="mediumPlus">
                            Found {result.matches.length} {result.matches.length === 1 ? 'match' : 'matches'}
                        </Text>
                        
                        <List
                            items={result.matches}
                            onRenderCell={(match) => (
                                match ? (
                                    <div style={{ padding: '8px 16px' }}>
                                        <Text>
                                            {highlightMatch(match.context, searchQuery)}
                                        </Text>
                                    </div>
                                ) : null
                            )}
                        />
                    </Stack>
                </DocumentCardDetails>
            </DocumentCard>
        );
    };

    return (
        <div>
            {results.length > 0 ? (
                <Stack tokens={stackTokens}>
                    {results.map(renderResultItem)}
                </Stack>
            ) : (
                <Text>No search results found.</Text>
            )}
        </div>
    );
};

export default SearchResults; 