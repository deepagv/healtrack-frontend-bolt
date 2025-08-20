import { Router, Request, Response } from 'express';
import { supabaseAdmin, verifyUserToken } from '../lib/supabaseAdmin';

const router = Router();

/**
 * DELETE /api/account/delete
 * Permanently delete a user account and all associated data
 */
router.delete('/delete', async (req: Request, res: Response) => {
  try {
    // Extract access token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authorization token required',
        message: 'Please provide a valid Bearer token in the Authorization header'
      });
    }

    const accessToken = authHeader.split(' ')[1];
    
    // Verify the token and get user
    let user;
    try {
      user = await verifyUserToken(accessToken);
    } catch (error) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    const userId = user.id;
    console.log(`Starting account deletion for user: ${userId}`);

    // Delete user data in dependency order (children first, then parents)
    const deletionSteps = [
      { table: 'medication_logs', description: 'medication logs' },
      { table: 'notifications', description: 'notifications' },
      { table: 'health_metrics', description: 'health metrics' },
      { table: 'goals', description: 'goals' },
      { table: 'appointments', description: 'appointments' },
      { table: 'medications', description: 'medications' },
      { table: 'profiles', description: 'profile' }
    ];

    // Track deletion results
    const deletionResults: Array<{ table: string; count: number }> = [];

    // Delete data from each table
    for (const step of deletionSteps) {
      try {
        const { count, error } = await supabaseAdmin
          .from(step.table)
          .delete()
          .eq('user_id', userId);

        if (error) {
          console.error(`Error deleting ${step.description}:`, error);
          return res.status(500).json({
            error: 'Database deletion failed',
            message: `Failed to delete ${step.description}: ${error.message}`,
            table: step.table
          });
        }

        deletionResults.push({ table: step.table, count: count || 0 });
        console.log(`Deleted ${count || 0} rows from ${step.table}`);
      } catch (error) {
        console.error(`Unexpected error deleting from ${step.table}:`, error);
        return res.status(500).json({
          error: 'Unexpected deletion error',
          message: `Unexpected error while deleting ${step.description}`,
          table: step.table
        });
      }
    }

    // Delete the user account from auth
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Error deleting user from auth:', authError);
        return res.status(500).json({
          error: 'Auth deletion failed',
          message: `Failed to delete user account: ${authError.message}`
        });
      }

      console.log(`Successfully deleted user account: ${userId}`);
    } catch (error) {
      console.error('Unexpected error deleting user:', error);
      return res.status(500).json({
        error: 'Unexpected auth deletion error',
        message: 'Unexpected error while deleting user account'
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
      deletedData: deletionResults,
      userId
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during account deletion'
    });
  }
});

export default router;