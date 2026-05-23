import Link from 'next/link';
import { GraduationCap, Users, Trophy, Calendar, Award, Target, MessageSquare, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'SDUR - Sociedad de Debate Universidad del Rosario',
  description: 'Sociedad de Debate de la Universidad del Rosario. Desarrollamos habilidades de argumentación, pensamiento crítico y oratoria.',
};

const STATS = [
  { label: 'Miembros Activos', value: '40+', icon: Users },
  { label: 'Debates por Semestre', value: '15+', icon: MessageSquare },
  { label: 'Torneos Nacionales', value: '10+', icon: Trophy },
  { label: 'Años de Trayectoria', value: '8', icon: Calendar },
];

const FEATURES = [
  {
    title: 'Formato Parlamentario Británico',
    description: 'Practicamos el formato BP (British Parliamentary), el estilo de debate más utilizado a nivel internacional.',
    icon: Target,
  },
  {
    title: 'Entrenamiento Semanal',
    description: 'Sesiones regulares de práctica, talleres de argumentación y briefings sobre temas de actualidad.',
    icon: Calendar,
  },
  {
    title: 'Torneos Competitivos',
    description: 'Participamos en torneos nacionales e internacionales representando a la Universidad del Rosario.',
    icon: Trophy,
  },
  {
    title: 'Comunidad Académica',
    description: 'Forma parte de una comunidad que valora el pensamiento crítico, la investigación y la expresión oral.',
    icon: Users,
  },
];

export default function PublicaPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">SDUR</h1>
              <p className="text-xs text-muted-foreground">Sociedad de Debate</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="#about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Nosotros
            </Link>
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Actividades
            </Link>
            <Link href="/dashboard">
              <Button size="sm">
                Ingresar
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              Universidad del Rosario
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-balance leading-tight">
              Sociedad de Debate
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Desarrollamos habilidades de argumentación, pensamiento crítico y oratoria 
              a través del debate parlamentario británico.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="px-8">
                  Acceder a la Plataforma
                </Button>
              </Link>
              <Link href="#about">
                <Button variant="outline" size="lg" className="px-8">
                  Conocer más
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Sobre Nosotros
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-balance">
              La Sociedad de Debate de la Universidad del Rosario (SDUR) es un espacio académico 
              dedicado a formar debatientes competitivos y ciudadanos críticos.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-8">
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Desde nuestra fundación, hemos formado a cientos de estudiantes en las artes 
                    de la argumentación y la oratoria. Nuestros miembros han representado a la 
                    Universidad en torneos nacionales e internacionales, obteniendo reconocimientos 
                    y construyendo una sólida reputación en el circuito de debate hispanohablante.
                  </p>
                  <p>
                    Practicamos el formato Parlamentario Británico (BP), que simula un debate 
                    parlamentario con cuatro equipos que asumen posiciones de gobierno y oposición. 
                    Este formato desarrolla habilidades de investigación, pensamiento crítico, 
                    construcción de argumentos y comunicación efectiva.
                  </p>
                  <p>
                    Más allá de la competencia, la SDUR es una comunidad de estudiantes apasionados 
                    por el conocimiento, el intercambio de ideas y el crecimiento personal.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Nuestras Actividades
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-balance">
              Ofrecemos un programa integral de formación y competencia en debate
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="bg-background">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Award className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Únete a la SDUR
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-balance">
              Si eres estudiante de la Universidad del Rosario y te interesa el debate, 
              te invitamos a conocer nuestras sesiones y formar parte de nuestra comunidad.
            </p>
            <div className="mt-8">
              <Link href="/dashboard">
                <Button size="lg" className="px-8">
                  Acceder a la Plataforma
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              ¿Preguntas? Escríbenos a{' '}
              <a
                href="mailto:debate@urosario.edu.co"
                className="text-primary hover:underline"
              >
                debate@urosario.edu.co
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">SDUR</p>
                <p className="text-xs text-muted-foreground">
                  Sociedad de Debate Universidad del Rosario
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SDUR. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
