# PostgreSQL Migration Guide

We have switched from MongoDB (Mongoose) to **PostgreSQL** using the **Prisma ORM**. This provides better data integrity and a more professional foundation for the No Dues Portal.

## 1. Prerequisites
- **PostgreSQL** must be installed on your system.
- Create a new database named `nodues_db`.

## 2. Update Environment Variables
Open your `.env` file and add your PostgreSQL connection string:

```env
# Replace USER, PASSWORD, and PORT if different
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/nodues_db?schema=public"
```

## 3. Apply the Database Schema
Run the following commands in the `nodues backend` directory:

```bash
# Generate the Prisma Client
npx prisma generate

# Create and apply the initial migration (This will create the tables)
npx prisma migrate dev --name init
```

## 4. Why we made this change
- **Reliability**: Approval stages are now strictly enforced.
- **Speed**: Relations between Students, Applications, and Approvals are native and faster.
- **Safety**: No more "missing fields" or accidental data corruption.

## 5. Next Steps
If you have existing test data in MongoDB, you will need to re-register those users or create a migration script. I can help you create a new seeding script for PostgreSQL if you'd like!
