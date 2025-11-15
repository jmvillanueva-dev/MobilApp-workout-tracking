import { supabase } from '../services/supabaseClient';
import { IRoutineRepository } from '../../domain/repositories/IRoutineRepository';
import { Routine, CreateRoutineRequest, UpdateRoutineRequest, RoutineExercise } from '../../domain/models';

/**
 * SupabaseRoutineRepository - Implementación concreta del repositorio de rutinas
 */
export class SupabaseRoutineRepository implements IRoutineRepository {

  async obtenerTodas(): Promise<{ success: boolean; data?: Routine[]; error?: string }> {
    try {
      console.log('🏋️ Obteniendo todas las rutinas...');
      
      const { data, error } = await supabase
        .from('routines')
        .select(`
          *,
          routine_exercises(
            *,
            exercises(*)
          )
        `)
        .order('name');

      if (error) {
        console.error('❌ Error obteniendo rutinas:', error);
        return { success: false, error: error.message };
      }

      const routines: Routine[] = data.map(item => this.mapToRoutine(item));
      console.log(`✅ ${routines.length} rutinas obtenidas`);
      return { success: true, data: routines };

    } catch (error: any) {
      console.error('❌ Error inesperado:', error);
      return { success: false, error: error.message };
    }
  }

  async obtenerPorEntrenador(trainerId: string): Promise<{ success: boolean; data?: Routine[]; error?: string }> {
    try {
      console.log('🏋️ Obteniendo rutinas del entrenador:', trainerId);
      
      const { data, error } = await supabase
        .from('routines')
        .select(`
          *,
          routine_exercises(
            *,
            exercises(*)
          )
        `)
        .eq('created_by', trainerId)
        .order('name');

      if (error) {
        return { success: false, error: error.message };
      }

      const routines: Routine[] = data.map(item => this.mapToRoutine(item));
      return { success: true, data: routines };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async obtenerPorId(id: number): Promise<{ success: boolean; data?: Routine; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          *,
          routine_exercises(
            *,
            exercises(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const routine = this.mapToRoutine(data);
      return { success: true, data: routine };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async crear(rutina: CreateRoutineRequest): Promise<{ success: boolean; data?: Routine; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          name: rutina.name,
          description: rutina.description,
          created_by: user.id
        })
        .select()
        .single();

      if (routineError) {
        return { success: false, error: routineError.message };
      }

      if (rutina.exercises && rutina.exercises.length > 0) {
        const exerciseData = rutina.exercises.map(exercise => ({
          routine_id: routineData.id,
          exercise_id: exercise.exerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.restSeconds,
          order: exercise.order
        }));

        const { error: exerciseError } = await supabase
          .from('routine_exercises')
          .insert(exerciseData);

        if (exerciseError) {
          return { success: false, error: exerciseError.message };
        }
      }

      return await this.obtenerPorId(routineData.id);

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async actualizar(id: number, rutina: UpdateRoutineRequest): Promise<{ success: boolean; data?: Routine; error?: string }> {
    try {
      const updateData: any = {};
      if (rutina.name !== undefined) updateData.name = rutina.name;
      if (rutina.description !== undefined) updateData.description = rutina.description;
      
      if (Object.keys(updateData).length > 0) {
        const { error: routineError } = await supabase
          .from('routines')
          .update(updateData)
          .eq('id', id);

        if (routineError) {
          return { success: false, error: routineError.message };
        }
      }

      if (rutina.exercises) {
        const { error: deleteError } = await supabase
          .from('routine_exercises')
          .delete()
          .eq('routine_id', id);

        if (deleteError) {
          return { success: false, error: deleteError.message };
        }

        if (rutina.exercises.length > 0) {
          const exerciseData = rutina.exercises.map(exercise => ({
            routine_id: id,
            exercise_id: exercise.exerciseId,
            sets: exercise.sets,
            reps: exercise.reps,
            rest_seconds: exercise.restSeconds,
            order: exercise.order
          }));

          const { error: insertError } = await supabase
            .from('routine_exercises')
            .insert(exerciseData);

          if (insertError) {
            return { success: false, error: insertError.message };
          }
        }
      }

      return await this.obtenerPorId(id);

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async eliminar(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async buscarPorNombre(query: string): Promise<{ success: boolean; data?: Routine[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          *,
          routine_exercises(
            *,
            exercises(*)
          )
        `)
        .ilike('name', `%${query}%`)
        .order('name');

      if (error) {
        return { success: false, error: error.message };
      }

      const routines: Routine[] = data.map(item => this.mapToRoutine(item));
      return { success: true, data: routines };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private mapToRoutine(data: any): Routine {
    const exercises: RoutineExercise[] = (data.routine_exercises || [])
      .map((item: any) => ({
        id: item.id,
        exerciseId: item.exercise_id,
        exercise: item.exercises ? {
          id: item.exercises.id,
          name: item.exercises.name,
          description: item.exercises.description,
          videoUrl: item.exercises.video_url
        } : undefined,
        sets: item.sets,
        reps: item.reps,
        restSeconds: item.rest_seconds,
        order: item.order
      }))
      .sort((a: RoutineExercise, b: RoutineExercise) => a.order - b.order);

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdBy: data.created_by,
      exercises,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined
    };
  }
}