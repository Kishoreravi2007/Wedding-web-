/**
 * Supabase User Database Helper
 * 
 * Provides a clean interface for database operations related to users.
 * This module is designed to be initialized with a Supabase client instance.
 */

module.exports = (supabaseClient) => ({
  /**
   * Create a new user record
   */
  async create(userData) {
    const { data, error } = await supabaseClient
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Find a user by username
   */
  async findByUsername(username) {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 means no rows found
    return data;
  },

  /**
   * Find a user by ID
   */
  async findById(id) {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Update a user's record
   */
  async update(id, updates) {
    const { data, error } = await supabaseClient
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Delete a user
   */
  async delete(id) {
    const { error } = await supabaseClient
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
});
