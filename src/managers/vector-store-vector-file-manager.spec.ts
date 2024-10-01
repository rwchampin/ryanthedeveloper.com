describe('Vector Store and File Manager', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/vector-manager');
    });

    // VectorStoreManager Tests
    describe('VectorStoreManager', () => {
        it('should add a vector', () => {
            cy.intercept('POST', '/api/vectors', { statusCode: 200 }).as('addVector');
            cy.get('#vector-id-input').type('vec_123');
            cy.get('#vector-values-input').type('0.1,0.2,0.3');
            cy.get('#add-vector-btn').click();
            cy.wait('@addVector');
            cy.get('#message').should('contain', 'Vector added successfully');
        });

        it('should get a vector', () => {
            cy.intercept('GET', '/api/vectors/*', { fixture: 'vector.json' }).as('getVector');
            cy.get('#vector-id-input').type('vec_123');
            cy.get('#get-vector-btn').click();
            cy.wait('@getVector');
            cy.get('#vector-details').should('contain', '0.1,0.2,0.3');
        });

        it('should update a vector', () => {
            cy.intercept('PUT', '/api/vectors/*', { statusCode: 200 }).as('updateVector');
            cy.get('#vector-id-input').type('vec_123');
            cy.get('#vector-values-input').type('0.4,0.5,0.6');
            cy.get('#update-vector-btn').click();
            cy.wait('@updateVector');
            cy.get('#message').should('contain', 'Vector updated successfully');
        });

        it('should delete a vector', () => {
            cy.intercept('DELETE', '/api/vectors/*', { statusCode: 200 }).as('deleteVector');
            cy.get('#vector-id-input').type('vec_123');
            cy.get('#delete-vector-btn').click();
            cy.wait('@deleteVector');
            cy.get('#message').should('contain', 'Vector deleted successfully');
        });

        it('should search similar vectors', () => {
            cy.intercept('POST', '/api/vectors/search', { fixture: 'similarVectors.json' }).as('searchVectors');
            cy.get('#query-vector-input').type('0.1,0.2,0.3');
            cy.get('#search-vectors-btn').click();
            cy.wait('@searchVectors');
            cy.get('#similar-vectors-list').should('contain', 'vec_456').and('contain', 'vec_789');
        });

        it('should create an embedding', () => {
            cy.intercept('POST', '/api/embeddings', { fixture: 'embedding.json' }).as('createEmbedding');
            cy.get('#text-input').type('Hello, world!');
            cy.get('#create-embedding-btn').click();
            cy.wait('@createEmbedding');
            cy.get('#embedding-result').should('not.be.empty');
        });
    });

    // VectorFileManager Tests
    describe('VectorFileManager', () => {
        it('should save a vector file', () => {
            cy.intercept('POST', '/api/vector-files', { fixture: 'savedVectorFile.json' }).as('saveVectorFile');
            cy.get('#file-input').attachFile('test.txt');
            cy.get('#save-vector-file-btn').click();
            cy.wait('@saveVectorFile');
            cy.get('#vector-file-id').should('not.be.empty');
        });

        it('should get a vector file', () => {
            cy.intercept('GET', '/api/vector-files/*', { fixture: 'vectorFile.json' }).as('getVectorFile');
            cy.get('#file-id-input').type('file_123');
            cy.get('#get-vector-file-btn').click();
            cy.wait('@getVectorFile');
            cy.get('#file-content').should('not.be.empty');
        });

        it('should delete a vector file', () => {
            cy.intercept('DELETE', '/api/vector-files/*', { statusCode: 200 }).as('deleteVectorFile');
            cy.get('#file-id-input').type('file_123');
            cy.get('#delete-vector-file-btn').click();
            cy.wait('@deleteVectorFile');
            cy.get('#message').should('contain', 'Vector file deleted successfully');
        });

        it('should update vector file metadata', () => {
            cy.intercept('PUT', '/api/vector-files/*/metadata', { statusCode: 200 }).as('updateMetadata');
            cy.get('#file-id-input').type('file_123');
            cy.get('#metadata-input').type('{"key":"value"}');
            cy.get('#update-metadata-btn').click();
            cy.wait('@updateMetadata');
            cy.get('#message').should('contain', 'Metadata updated successfully');
        });

        it('should search similar files', () => {
            cy.intercept('POST', '/api/vector-files/search', { fixture: 'similarFiles.json' }).as('searchFiles');
            cy.get('#query-text-input').type('Hello, world!');
            cy.get('#search-files-btn').click();
            cy.wait('@searchFiles');
            cy.get('#similar-files-list').should('contain', 'file_456').and('contain', 'file_789');
        });
    });
});