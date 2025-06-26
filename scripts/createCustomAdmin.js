const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function createCustomAdminUser() {
  // Change these to your preferred credentials
  const email = 'parth@gmail.com';
  const password = '123'; // Change this to your preferred password
  const name = 'Parth Admin';

  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Admin user already exists, updating password...');
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update the existing user's password
      await prisma.user.update({
        where: { email },
        data: {
          hashedPassword: hashedPassword,
          password: '', // Clear the old password field
          name,
        },
      });
      
      console.log('Admin user password updated successfully:');
      console.log(`Email: ${email}`);
      console.log(`New Password: ${password}`);
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the admin user
      const adminUser = await prisma.user.create({
        data: {
          email,
          hashedPassword: hashedPassword,
          password: '', // Set empty string for backward compatibility
          name,
          role: Role.ADMIN,
        },
      });

      console.log('Admin user created successfully:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    }
    
    console.log('Please change this password after first login!');
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCustomAdminUser(); 