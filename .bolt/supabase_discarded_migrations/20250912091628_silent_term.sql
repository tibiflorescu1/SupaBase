/*
  # Fix duplicate policies for categorii table

  This migration cleans up any duplicate policies on the categorii table
  and ensures only the correct public read policy exists.

  1. Security Changes
    - Remove all existing SELECT policies on categorii table
    - Create single "Public can read categorii" policy
    - Ensure no duplicates remain

  2. Policy Details
    - Allows public read access to all categorii records
    - Uses simple `true` condition for maximum compatibility
    - Prevents future duplicate policy issues
*/

-- Step 1: Remove ALL existing SELECT policies on categorii table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all SELECT policies for categorii table
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename = 'categorii' 
        AND cmd = 'SELECT'
    LOOP
        -- Drop each policy found
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
        
        RAISE NOTICE 'Dropped policy: % on %.%', 
                     policy_record.policyname, 
                     policy_record.schemaname, 
                     policy_record.tablename;
    END LOOP;
    
    -- Verify cleanup
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'categorii' AND cmd = 'SELECT'
    ) THEN
        RAISE WARNING 'Some SELECT policies still exist on categorii table';
    ELSE
        RAISE NOTICE 'All SELECT policies successfully removed from categorii table';
    END IF;
END $$;

-- Step 2: Create the single correct policy
CREATE POLICY "Public can read categorii" ON categorii
    FOR SELECT 
    TO public
    USING (true);

-- Step 3: Verify the final state
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'categorii' AND cmd = 'SELECT';
    
    RAISE NOTICE 'Final SELECT policy count for categorii: %', policy_count;
    
    IF policy_count = 1 THEN
        RAISE NOTICE '✅ SUCCESS: Exactly one SELECT policy exists for categorii table';
    ELSE
        RAISE WARNING '⚠️  WARNING: Expected 1 SELECT policy, found %', policy_count;
    END IF;
END $$;