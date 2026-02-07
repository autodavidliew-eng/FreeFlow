// ============================================================================
// FreeFlow MongoDB Initialization Script
// ============================================================================
// This script runs automatically on first container startup via Docker's
// /docker-entrypoint-initdb.d/ directory.
//
// ⚠️  DEV ONLY: Uses simple credentials. NEVER use these in production!
// ============================================================================

// Helper function to print colored output
function printSection(title) {
  print('\n' + '='.repeat(76));
  print('  ' + title);
  print('='.repeat(76) + '\n');
}

function printSuccess(message) {
  print('✓ ' + message);
}

function printInfo(message) {
  print('→ ' + message);
}

printSection('FreeFlow MongoDB Initialization');

// ============================================================================
// SWITCH TO ADMIN DATABASE
// ============================================================================

db = db.getSiblingDB('admin');
printInfo('Connected to admin database');

// ============================================================================
// CREATE APPLICATION ADMIN USER
// ============================================================================

try {
  db.createUser({
    user: 'freeflow_admin',
    pwd: 'freeflow_admin_password',
    roles: [
      { role: 'userAdminAnyDatabase', db: 'admin' },
      { role: 'dbAdminAnyDatabase', db: 'admin' },
      { role: 'readWriteAnyDatabase', db: 'admin' }
    ]
  });
  printSuccess('Application admin user "freeflow_admin" created');
} catch (e) {
  if (e.code === 51003) {
    printInfo('User "freeflow_admin" already exists');
  } else {
    print('✗ Error creating admin user: ' + e.message);
  }
}

// ============================================================================
// CREATE FREEFLOW DATABASE AND USER
// ============================================================================

db = db.getSiblingDB('freeflow');
printInfo('Switched to freeflow database');

// Create application user with read/write access
try {
  db.createUser({
    user: 'freeflow_user',
    pwd: 'freeflow_user_password',
    roles: [
      { role: 'readWrite', db: 'freeflow' },
      { role: 'dbAdmin', db: 'freeflow' }
    ]
  });
  printSuccess('Application user "freeflow_user" created for freeflow database');
} catch (e) {
  if (e.code === 51003) {
    printInfo('User "freeflow_user" already exists');
  } else {
    print('✗ Error creating user: ' + e.message);
  }
}

// ============================================================================
// CREATE COLLECTIONS WITH SCHEMA VALIDATION
// ============================================================================

printSection('Creating Collections with Schema Validation');

// Users collection
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'username', 'createdAt'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Valid email address'
        },
        username: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 50,
          description: 'Username (3-50 characters)'
        },
        fullName: {
          bsonType: 'string',
          description: 'Full name of the user'
        },
        profile: {
          bsonType: 'object',
          properties: {
            avatar: { bsonType: 'string' },
            bio: { bsonType: 'string' },
            location: { bsonType: 'string' },
            website: { bsonType: 'string' }
          }
        },
        preferences: {
          bsonType: 'object',
          properties: {
            theme: { enum: ['light', 'dark', 'auto'] },
            language: { bsonType: 'string' },
            notifications: { bsonType: 'bool' },
            timezone: { bsonType: 'string' }
          }
        },
        isActive: {
          bsonType: 'bool',
          description: 'Account active status'
        },
        isVerified: {
          bsonType: 'bool',
          description: 'Email verification status'
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
        lastLoginAt: { bsonType: 'date' }
      }
    }
  }
});
printSuccess('Collection "users" created with schema validation');

// Documents collection
db.createCollection('documents', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'owner', 'createdAt'],
      properties: {
        title: { bsonType: 'string', description: 'Document title' },
        content: { bsonType: 'object', description: 'Document content' },
        owner: { bsonType: 'string', description: 'User ID of owner' },
        organization: { bsonType: 'string', description: 'Organization ID' },
        tags: {
          bsonType: 'array',
          items: { bsonType: 'string' },
          description: 'Document tags'
        },
        status: {
          enum: ['draft', 'published', 'archived'],
          description: 'Document status'
        },
        metadata: { bsonType: 'object' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});
printSuccess('Collection "documents" created');

// Workflows collection
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
          description: 'Workflow status'
        },
        definition: {
          bsonType: 'object',
          description: 'Workflow definition/configuration'
        },
        variables: { bsonType: 'object' },
        owner: { bsonType: 'string' },
        organization: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
        startedAt: { bsonType: 'date' },
        completedAt: { bsonType: 'date' }
      }
    }
  }
});
printSuccess('Collection "workflows" created');

// Forms collection
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
          description: 'UI configuration'
        },
        version: { bsonType: 'int' },
        published: { bsonType: 'bool' },
        owner: { bsonType: 'string' },
        organization: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});
printSuccess('Collection "forms" created');

// Organizations collection
db.createCollection('organizations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'slug', 'createdAt'],
      properties: {
        name: { bsonType: 'string' },
        slug: { bsonType: 'string', pattern: '^[a-z0-9-]+$' },
        description: { bsonType: 'string' },
        settings: { bsonType: 'object' },
        isActive: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});
printSuccess('Collection "organizations" created');

// ============================================================================
// CREATE INDEXES
// ============================================================================

printSection('Creating Indexes');

// Users indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ 'profile.fullName': 'text', email: 'text' });
printSuccess('Users indexes created');

// Documents indexes
db.documents.createIndex({ owner: 1 });
db.documents.createIndex({ organization: 1 });
db.documents.createIndex({ title: 'text', 'content.text': 'text' });
db.documents.createIndex({ tags: 1 });
db.documents.createIndex({ status: 1 });
db.documents.createIndex({ createdAt: -1 });
db.documents.createIndex({ updatedAt: -1 });
db.documents.createIndex({ owner: 1, createdAt: -1 });
printSuccess('Documents indexes created');

// Workflows indexes
db.workflows.createIndex({ status: 1 });
db.workflows.createIndex({ owner: 1 });
db.workflows.createIndex({ organization: 1 });
db.workflows.createIndex({ createdAt: -1 });
db.workflows.createIndex({ name: 'text', description: 'text' });
db.workflows.createIndex({ status: 1, updatedAt: -1 });
printSuccess('Workflows indexes created');

// Forms indexes
db.forms.createIndex({ name: 1 });
db.forms.createIndex({ published: 1 });
db.forms.createIndex({ version: 1 });
db.forms.createIndex({ owner: 1 });
db.forms.createIndex({ organization: 1 });
db.forms.createIndex({ name: 1, version: -1 });
printSuccess('Forms indexes created');

// Organizations indexes
db.organizations.createIndex({ slug: 1 }, { unique: true });
db.organizations.createIndex({ name: 1 });
db.organizations.createIndex({ isActive: 1 });
printSuccess('Organizations indexes created');

// ============================================================================
// INSERT SAMPLE DATA (DEV ONLY)
// ============================================================================

printSection('Inserting Sample Data');

// Sample organizations
db.organizations.insertMany([
  {
    name: 'FreeFlow Demo',
    slug: 'freeflow-demo',
    description: 'Demo organization for testing',
    settings: { allowPublicSignup: true },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'ACME Corporation',
    slug: 'acme-corp',
    description: 'Sample corporate organization',
    settings: { allowPublicSignup: false },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
printSuccess('Sample organizations inserted');

// Sample users
db.users.insertMany([
  {
    email: 'admin@freeflow.dev',
    username: 'admin',
    fullName: 'Admin User',
    profile: {
      avatar: 'https://via.placeholder.com/150',
      bio: 'System administrator',
      location: 'San Francisco, CA'
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      notifications: true,
      timezone: 'America/Los_Angeles'
    },
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'operator@freeflow.dev',
    username: 'operator',
    fullName: 'Operator User',
    profile: {
      avatar: 'https://via.placeholder.com/150',
      bio: 'Operations team member'
    },
    preferences: {
      theme: 'light',
      language: 'en',
      notifications: true,
      timezone: 'America/New_York'
    },
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    email: 'viewer@freeflow.dev',
    username: 'viewer',
    fullName: 'Viewer User',
    profile: {
      avatar: 'https://via.placeholder.com/150',
      bio: 'Read-only user'
    },
    preferences: {
      theme: 'auto',
      language: 'en',
      notifications: false,
      timezone: 'UTC'
    },
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
printSuccess('Sample users inserted');

// Sample document
const demoOrg = db.organizations.findOne({ slug: 'freeflow-demo' });
const adminUser = db.users.findOne({ username: 'admin' });

db.documents.insertOne({
  title: 'Welcome to FreeFlow',
  content: {
    text: 'This is a sample document to help you get started with FreeFlow.',
    sections: [
      { heading: 'Getting Started', body: 'Follow the quick start guide...' },
      { heading: 'Features', body: 'Explore the powerful features...' }
    ]
  },
  owner: adminUser._id.toString(),
  organization: demoOrg._id.toString(),
  tags: ['welcome', 'documentation', 'getting-started'],
  status: 'published',
  metadata: { views: 0, likes: 0 },
  createdAt: new Date(),
  updatedAt: new Date()
});
printSuccess('Sample document inserted');

// ============================================================================
// CREATE FORM.IO DATABASE (if using formio profile)
// ============================================================================

db = db.getSiblingDB('formio');
printInfo('Switched to formio database');

// Create formio user
try {
  db.createUser({
    user: 'formio_user',
    pwd: 'formio_user_password',
    roles: [
      { role: 'readWrite', db: 'formio' },
      { role: 'dbAdmin', db: 'formio' }
    ]
  });
  printSuccess('Form.io user "formio_user" created');
} catch (e) {
  if (e.code === 51003) {
    printInfo('User "formio_user" already exists');
  }
}

// Create basic collections for Form.io
db.createCollection('forms');
db.createCollection('submissions');
db.createCollection('actions');
printSuccess('Form.io collections created');

// ============================================================================
// DISPLAY SUMMARY
// ============================================================================

printSection('MongoDB Initialization Complete!');

print('\nDatabases created:');
print('  • admin     - System administration');
print('  • freeflow  - Main application database');
print('  • formio    - Form.io server database (optional)');

print('\nUsers created:');
print('  • Root user:         freeflow / freeflow_dev_password (from env)');
print('  • Admin user:        freeflow_admin / freeflow_admin_password');
print('  • Application user:  freeflow_user / freeflow_user_password');
print('  • Form.io user:      formio_user / formio_user_password');

print('\nCollections in freeflow database:');
print('  • users         - User accounts and profiles');
print('  • documents     - Document storage');
print('  • workflows     - Workflow definitions and instances');
print('  • forms         - Form schemas and configurations');
print('  • organizations - Organization/tenant data');

print('\n⚠️  WARNING: These credentials are for DEVELOPMENT ONLY!');
print('   Change all passwords before production deployment.');

print('\nConnection strings:');
print('  mongodb://freeflow_user:freeflow_user_password@localhost:27017/freeflow');
print('  mongodb://formio_user:formio_user_password@localhost:27017/formio');

print('\n' + '='.repeat(76) + '\n');
