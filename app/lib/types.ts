/**
 * Utility type definition for command palette search
 * Represents a utility tool that can be searched and accessed via the command palette
 */
export interface Utility {
  /** Unique identifier for the utility */
  id: string;
  
  /** Display name of the utility */
  name: string;
  
  /** Short description of what the utility does */
  description: string;
  
  /** Category the utility belongs to (e.g., "Text Tools") */
  category: string;
  
  /** Keywords for improved search */
  tags: string[];
  
  /** Route path to the utility */
  path: string;
  
  /** Optional icon component */
  icon?: React.ComponentType<{ className?: string }>;
}