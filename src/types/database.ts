export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MissionStatus = "ready" | "completed" | "archived";
export type StudySessionStatus = "active" | "completed" | "failed";
export type AchievementKey = "first_step" | "serious_student" | "xp_100_club" | "level_up";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  total_xp: number;
  created_at: string;
  updated_at: string;
};

export type MissionRow = {
  id: string;
  user_id: string;
  subject: string;
  title: string;
  description: string;
  duration_minutes: number;
  status: MissionStatus;
  created_at: string;
  updated_at: string;
};

export type StudySessionRow = {
  id: string;
  user_id: string;
  mission_id: string;
  status: StudySessionStatus;
  started_at: string;
  completed_at: string | null;
  xp_awarded: number;
  created_at: string;
  updated_at: string;
};

export type AchievementRow = {
  id: string;
  key: AchievementKey;
  name: string;
  description: string;
  icon: string;
  requirement_type: "missions_completed" | "total_xp" | "level";
  requirement_value: number;
  created_at: string;
  updated_at: string;
};

export type UserAchievementRow = {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  created_at: string;
  updated_at: string;
};

export type StreakRow = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: {
          id: string;
          name: string;
          email: string;
          total_xp?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserRow, "id" | "created_at">>;
        Relationships: [];
      };
      missions: {
        Row: MissionRow;
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          title: string;
          description: string;
          duration_minutes: number;
          status?: MissionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<MissionRow, "id" | "user_id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "missions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      study_sessions: {
        Row: StudySessionRow;
        Insert: {
          id?: string;
          user_id: string;
          mission_id: string;
          status?: StudySessionStatus;
          started_at?: string;
          completed_at?: string | null;
          xp_awarded?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<StudySessionRow, "id" | "user_id" | "mission_id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "study_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "study_sessions_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "missions";
            referencedColumns: ["id"];
          }
        ];
      };
      achievements: {
        Row: AchievementRow;
        Insert: {
          id?: string;
          key: AchievementKey;
          name: string;
          description: string;
          icon: string;
          requirement_type: AchievementRow["requirement_type"];
          requirement_value: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AchievementRow, "id" | "created_at">>;
        Relationships: [];
      };
      user_achievements: {
        Row: UserAchievementRow;
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserAchievementRow, "id" | "user_id" | "achievement_id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey";
            columns: ["achievement_id"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["id"];
          }
        ];
      };
      streaks: {
        Row: StreakRow;
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_completed_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<StreakRow, "id" | "user_id" | "created_at">>;
        Relationships: [
          {
            foreignKeyName: "streaks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
