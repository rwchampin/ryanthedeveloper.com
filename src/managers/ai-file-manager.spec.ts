describe('OpenAIFileUtility', () => {
    beforeEach(() => {
        // Assuming we have a web page that exposes our API
        cy.visit('http://localhost:3000/api-test-page');
    });

    it('should get all files', () => {
        cy.intercept('GET', '/api/files', { fixture: 'allFiles.json' }).as('getAllFiles');
        cy.get('#get-all-files-btn').click();
        cy.wait('@getAllFiles');
        cy.get('#file-list').should('contain', 'file1.txt').and('contain', 'file2.txt');
    });

    it('should get file by ID', () => {
        cy.intercept('GET', '/api/files/*', { fixture: 'singleFile.json' }).as('getFileById');
        cy.get('#file-id-input').type('file1');
        cy.get('#get-file-by-id-btn').click();
        cy.wait('@getFileById');
        cy.get('#file-details').should('contain', 'file1.txt');
    });

    it('should get files by name', () => {
        cy.intercept('GET', '/api/files/name/*', { fixture: 'filesByName.json' }).as('getFilesByName');
        cy.get('#file-name-input').type('test.txt');
        cy.get('#get-files-by-name-btn').click();
        cy.wait('@getFilesByName');
        cy.get('#file-list').should('contain', 'test.txt');
    });

    it('should delete all files', () => {
        cy.intercept('DELETE', '/api/files', { statusCode: 200 }).as('deleteAllFiles');
        cy.get('#delete-all-files-btn').click();
        cy.wait('@deleteAllFiles');
        cy.get('#message').should('contain', 'All files deleted successfully');
    });

    it('should delete file by ID', () => {
        cy.intercept('DELETE', '/api/files/*', { statusCode: 200 }).as('deleteFileById');
        cy.get('#file-id-input').type('file1');
        cy.get('#delete-file-by-id-btn').click();
        cy.wait('@deleteFileById');
        cy.get('#message').should('contain', 'File deleted successfully');
    });

    it('should delete files by name', () => {
        cy.intercept('DELETE', '/api/files/name/*', { statusCode: 200 }).as('deleteFilesByName');
        cy.get('#file-name-input').type('test.txt');
        cy.get('#delete-files-by-name-btn').click();
        cy.wait('@deleteFilesByName');
        cy.get('#message').should('contain', 'Files deleted successfully');
    });

    it('should create file if not exists', () => {
        cy.intercept('POST', '/api/files', { fixture: 'createdFile.json' }).as('createFile');
        cy.get('#file-path-input').type('/path/to/file.txt');
        cy.get('#file-purpose-select').select('fine-tune');
        cy.get('#create-file-btn').click();
        cy.wait('@createFile');
        cy.get('#file-details').should('contain', 'file.txt');
    });

    it('should retrieve file content', () => {
        cy.intercept('GET', '/api/files/*/content', { body: 'File content' }).as('getFileContent');
        cy.get('#file-id-input').type('file1');
        cy.get('#get-file-content-btn').click();
        cy.wait('@getFileContent');
        cy.get('#file-content').should('contain', 'File content');
    });

    it('should wait for file processing', () => {
        cy.intercept('GET', '/api/files/*/status', { body: { status: 'processed' } }).as('getFileStatus');
        cy.get('#file-id-input').type('file1');
        cy.get('#wait-for-processing-btn').click();
        cy.wait('@getFileStatus');
        cy.get('#file-status').should('contain', 'processed');
    });

    it('should get total file size', () => {
        cy.intercept('GET', '/api/files/size', { body: { totalSize: 1000000 } }).as('getTotalSize');
        cy.get('#get-total-size-btn').click();
        cy.wait('@getTotalSize');
        cy.get('#total-size').should('contain', '1000000');
    });

    it('should get files by purpose', () => {
        cy.intercept('GET', '/api/files/purpose/*', { fixture: 'filesByPurpose.json' }).as('getFilesByPurpose');
        cy.get('#file-purpose-select').select('fine-tune');
        cy.get('#get-files-by-purpose-btn').click();
        cy.wait('@getFilesByPurpose');
        cy.get('#file-list').should('contain', 'fine-tune-file.txt');
    });

    it('should batch create files', () => {
        cy.intercept('POST', '/api/files/batch', { fixture: 'batchCreatedFiles.json' }).as('batchCreateFiles');
        cy.get('#file-paths-input').type('/path1.txt,/path2.txt');
        cy.get('#file-purpose-select').select('fine-tune');
        cy.get('#batch-create-files-btn').click();
        cy.wait('@batchCreateFiles');
        cy.get('#file-list').should('contain', 'path1.txt').and('contain', 'path2.txt');
    });

    it('should find duplicate files', () => {
        cy.intercept('GET', '/api/files/duplicates', { fixture: 'duplicateFiles.json' }).as('findDuplicates');
        cy.get('#find-duplicates-btn').click();
        cy.wait('@findDuplicates');
        cy.get('#duplicate-files').should('contain', 'duplicate.txt');
    });

    it('should delete file if not attached', () => {
        cy.intercept('DELETE', '/api/files/*/if-not-attached', { body: { deleted: true } }).as('deleteIfNotAttached');
        cy.get('#file-id-input').type('file1');
        cy.get('#delete-if-not-attached-btn').click();
        cy.wait('@deleteIfNotAttached');
        cy.get('#message').should('contain', 'File deleted successfully');
    });
});