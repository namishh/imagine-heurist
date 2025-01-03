import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import History from '@/modules/generate/history'
import PDAs from '@/modules/generate/pdas'
import Generate from '@/modules/generate/video'
import { Author } from '@/modules/models/author'

const fetchStatus = async () => {
  const res = await fetch('https://sequencer-v2.heurist.xyz/miner_stats')
  const data = await res.json()
  return data
}

export default async function ({ model }: any) {
  const data = await fetchStatus()
  const { miner_count } = data
  return (
    <main className="-mt-20 flex-1 pt-20">
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-8 md:max-w-[1440px]">
        <div className="flex items-center justify-start">
          <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            {model}
          </h2>
          {
            <div className="ml-10 flex items-center gap-2">
              {miner_count > 0 ? (
                <span className="flex items-center justify-center">
                  🟢
                  <span className="ml-2 text-muted-foreground">
                    Servers active
                  </span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  🔴
                  <span className="ml-2 text-muted-foreground">
                    Servers inactive
                  </span>
                </span>
              )}
            </div>
          }
        </div>
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
