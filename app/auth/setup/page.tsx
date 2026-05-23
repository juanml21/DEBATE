'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Shield, AlertCircle, Check } from 'lucide-react'

export default function SetupPage() {
  const [checkingSetup, setCheckingSetup] = useState(true)
  const [alreadySetup, setAlreadySetup] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName1: '',
    lastName2: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkIfDirectorExists()
  }, [])

  async function checkIfDirectorExists() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'director')
      .limit(1)

    if (error) {
      console.log('[v0] Error checking director:', error)
      setCheckingSetup(false)
      return
    }

    if (data && data.length > 0) {
      setAlreadySetup(true)
    }
    setCheckingSetup(false)
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    // Validate password strength
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    const supabase = createClient()
    
    // Create the director account
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          first_name: form.firstName,
          last_name_1: form.lastName1,
          last_name_2: form.lastName2 || null,
          role: 'director',
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      setSuccess(true)
      // Wait a bit then redirect
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    }
  }

  if (checkingSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (alreadySetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle>Sistema ya configurado</CardTitle>
            <CardDescription>
              Ya existe un Director Academico registrado en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => router.push('/auth/login')}
            >
              Ir a Iniciar Sesion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle>Cuenta creada exitosamente</CardTitle>
            <CardDescription>
              Revisa tu correo para confirmar tu cuenta. Seras redirigido al login en unos segundos...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => router.push('/auth/login')}
            >
              Ir a Iniciar Sesion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configuracion Inicial</CardTitle>
          <CardDescription>
            Crea la cuenta del Director Academico para comenzar a usar el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">
                Nombre(s) <span className="text-destructive">*</span>
              </label>
              <Input
                id="firstName"
                placeholder="Ej: Juan Carlos"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="lastName1" className="text-sm font-medium">
                  Primer Apellido <span className="text-destructive">*</span>
                </label>
                <Input
                  id="lastName1"
                  placeholder="Ej: Rodriguez"
                  value={form.lastName1}
                  onChange={(e) => setForm({ ...form, lastName1: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName2" className="text-sm font-medium">
                  Segundo Apellido
                </label>
                <Input
                  id="lastName2"
                  placeholder="Ej: Garcia"
                  value={form.lastName2}
                  onChange={(e) => setForm({ ...form, lastName2: e.target.value })}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Correo Institucional <span className="text-destructive">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu.correo@urosario.edu.co"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña <span className="text-destructive">*</span>
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Minimo 6 caracteres"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Contraseña <span className="text-destructive">*</span>
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta de Director'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
