import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import History from '@/modules/generate/history'
import PDAs from '@/modules/generate/pdas'
import Generate from '@/modules/generate/video'
import { Author } from '@/modules/models/author'

export default function ({ model }: any) {
  return (
    <main className="-mt-20 flex-1 pt-20">
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-8 md:max-w-[1440px]">
        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          {model}
        </h2>
        <p className="text-muted-foreground">
          Created by <b className="text-foreground">Tencent</b>
        </p>
        <Separator className="my-6" />
        <Tabs defaultValue="generate">
          <TabsList>
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="history" className="items-end gap-1">
              History
              <span className="text-muted-foreground">(Latest 50)</span>
            </TabsTrigger>
            {/* <TabsTrigger value="pdas" className="gap-1 items-end">
                PDAs
              </TabsTrigger> */}
          </TabsList>
          <TabsContent value="generate">
            <Generate model={model} models={[]} isXl={false} />
          </TabsContent>
          <TabsContent value="history">
            <History model={model} />
          </TabsContent>
          <TabsContent value="pdas">
            <PDAs />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
