import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useExpenses() {
  const [gastos, setGastos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGastos = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('gastos')
      .select('*')
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setGastos(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGastos()
  }, [fetchGastos])

  const crearGasto = useCallback(
    async (gasto) => {
      const { error: insertError } = await supabase.from('gastos').insert([gasto])
      if (insertError) throw insertError
      await fetchGastos()
    },
    [fetchGastos]
  )

  const actualizarGasto = useCallback(
    async (id, cambios) => {
      const { error: updateError } = await supabase.from('gastos').update(cambios).eq('id', id)
      if (updateError) throw updateError
      await fetchGastos()
    },
    [fetchGastos]
  )

  const eliminarGasto = useCallback(
    async (id) => {
      const { error: deleteError } = await supabase.from('gastos').delete().eq('id', id)
      if (deleteError) throw deleteError
      await fetchGastos()
    },
    [fetchGastos]
  )

  return { gastos, loading, error, fetchGastos, crearGasto, actualizarGasto, eliminarGasto }
}
