// FreeFlow MongoDB Initialization Script
// This script runs on first container startup

// Switch to freeflow database
db = db.getSiblingDB('freeflow');

// Create collections with validators
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'username', 'createdAt'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address'
        },
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 50,
          description: 'must be a string between 3 and 50 characters'
        },
        profile: {
          bsonType: 'object',
          properties: {
            firstName: { bsonType: 'string' },
            lastName: { bsonType: 'string' },
            avatar: { bsonType: 'string' },
            bio: { bsonType: 'string' }
          }
        },
        preferences: {
          bsonType: 'object',
          properties: {
            theme: { enum: ['light', 'dark', 'auto'] },
            language: { bsonType: 'string' },
            notifications: { bsonType: 'bool' }
          }
        },
        createdAt: {
          bsonType: 'date',
          description: 'must be a date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('documents', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'content', 'owner', 'createdAt'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'must be a string'
        },
        content: {
          bsonType: 'object',
          description: 'document content as structured data'
        },
        owner: {
          bsonType: 'string',
          description: 'user id of document owner'
        },
        tags: {
          bsonType: 'array',
          items: { bsonType: 'string' }
        },
        metadata: {
          bsonType: 'object'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('workflows', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'status', 'createdAt'],
      properties: {
        name: { bsonType: 'string' },
        description: { bsonType: 'string' },
        status: {
          enum: ['draft', 'active', 'paused', 'completed', 'archived'],
          description: 'workflow status'
        },
        definition: {
          bsonType: 'object',
          description: 'workflow definition/configuration'
        },
        variables: {
          bsonType: 'object',
          description: 'workflow instance variables'
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
        completedAt: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('forms', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'schema', 'createdAt'],
      properties: {
        name: { bsonType: 'string' },
        description: { bsonType: 'string' },
        schema: {
          bsonType: 'object',
          description: 'JSON schema for the form'
        },
        uiSchema: {
          bsonType: 'object',
          description: 'UI configuration for form rendering'
        },
        version: { bsonType: 'int' },
        published: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ 'profile.firstName': 'text', 'profile.lastName': 'text' });

db.documents.createIndex({ owner: 1 });
db.documents.createIndex({ title: 'text', 'content.text': 'text' });
db.documents.createIndex({ tags: 1 });
db.documents.createIndex({ createdAt: -1 });
db.documents.createIndex({ updatedAt: -1 });

db.workflows.createIndex({ status: 1 });
db.workflows.createIndex({ createdAt: -1 });
db.workflows.createIndex({ name: 'text', description: 'text' });

db.forms.createIndex({ name: 1 });
db.forms.createIndex({ published: 1 });
db.forms.createIndex({ version: 1 });

// Insert sample data (for development only)
db.users.insertMany([
  {
    email: 'admin@freeflow.dev',
    username: 'admin',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      bio: 'System administrator'
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'user@freeflow.dev',
    username: 'testuser',
    profile: {
      firstName: 'Test',
      lastName: 'User',
      bio: 'Test user account'
    },
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create form.io database if using formio profile
db = db.getSiblingDB('formio');
db.createCollection('forms');
db.createCollection('submissions');
db.createCollection('actions');

print('✓ FreeFlow MongoDB initialization completed successfully');
print('✓ Created collections: users, documents, workflows, forms');
print('✓ Created indexes for optimal query performance');
print('✓ Inserted sample data for development');
