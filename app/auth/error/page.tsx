'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle>Error de Autenticacion</CardTitle>
          <CardDescription>
            Hubo un problema al verificar tu cuenta. Por favor intenta nuevamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Volver a Iniciar Sesion
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/setup">
              Configuracion Inicial
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
