'use client'

import { Info, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useLocalStorage } from 'usehooks-ts'
import { useAccount } from 'wagmi'
import { z } from 'zod'

import {
  generateVideo,
  getGenerateVideoResult,
  issueToGateway,
} from '@/app/actions'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useConnectModal } from '@rainbow-me/rainbowkit'

interface GenerateProps {
  model: string
  models: any[]
  isXl?: boolean
}

interface TooltipProps {
  content: any
  children: any
}

function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="group relative">
      {children}
      <div className="invisible absolute left-full z-10 -mt-2 ml-2 w-48 rounded bg-gray-800 p-2 text-xs text-white group-hover:visible">
        {content}
      </div>
    </div>
  )
}

export default function Generate({ model, models, isXl }: GenerateProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingUpload, setLoadingUpload] = useState(false)
  const [showRecommend, setShowRecommend] = useState(false)
  const [modelInfo, setModelInfo] = useState<any>({})
  const [history, setHistory] = useLocalStorage<any[]>('IMAGINE_HISTORY', [])
  const [csvData, setCsvData] = useState<any[]>([])

  const [result, setResult] = useState({
    url: '',
    workflow_id: '',
  })
  const [transactionId, setTransactionId] = useState('')
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [proxyUrl, setProxyUrl] = useState<string>('')
  const { address, chain } = useAccount()

  let loopTimer: any = null
  // Philand results need pixelation
  const [isTextToVideo, setIsVideo] = useState(false)
  useEffect(() => {
    // Hunyuan
    setIsVideo(model === 'Hunyuan')
    console.log('model name', model)
  }, [model])
  useEffect(() => {
    const generateVideoTask = localStorage.getItem('generateVideoTask')
    console.log('generateVideoTask', generateVideoTask)
    const generateVideoTaskObj = JSON.parse(generateVideoTask || '{}')
    if (generateVideoTaskObj.generateVideoTaskId) {
      setIsGenerating(true)
      loopTaskId(generateVideoTaskObj.generateVideoTaskId)
    }

    fetch(
      'https://raw.githubusercontent.com/heurist-network/imagine/refs/heads/to-deploy/data/Heurist-Imaginaries-snapshot.csv',
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.text()
      })
      .then((data) => {
        if (!data) {
          console.log('not data')
          return
        }
        // 改进的CSV解析方式，移除\r字符
        const rows = data
          .split('\n')
          .map((row) => row.trim().replace('\r', ''))
          .map((row) => row.split(',')[0])
          .filter(Boolean) // 移除空行
        setCsvData(rows)
      })
      .catch((error) => {
        console.error('get or parse csv error:', error)
      })
  }, [])

  const formSchema = z.object({
    prompt: z.string().optional(),
    neg_prompt: z.string().optional(),
    num_iterations: z.number(),
    guidance_scale: z.number(),
    width: z
      .number()
      .min(848)
      .max(modelInfo.defaults?.max_width || 1024),
    height: z
      .number()
      .min(480)
      .max(modelInfo.defaults?.max_height || 1024),
    model: z.string().optional(),
    workflow_id: z.string().optional(), // 1是hunyuan 2是mochi
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      neg_prompt: '',
      num_iterations: 30,
      guidance_scale: 7,
      width: 848,
      height: 480,
      workflow_id: '1',
    },
  })

  const onSubmit = async () => {
    setResult({ url: '', workflow_id: '' })
    console.log('-- address --', address)
    // csvData
    const addressExists = csvData.some(
      (addr) => addr.toLowerCase() === address?.toLowerCase(),
    )
    console.log('isnt includes', addressExists)
    if (!address) {
      toast.error('Please connect your wallet')
      return
    } else if (!addressExists) {
      toast.error('You are not in the NFT whitelist')
      return
    }
    const params = { ...form.getValues() }
    if (params.prompt === '') {
      toast.error('Prompt is required')
      return
    }
    try {
      setIsGenerating(true)
      const params = { ...form.getValues() }

      const res = await generateVideo(params)
      // console.log('返回 res: ', res)
      if (res.status !== 200) {
        toast.error(
          res.message || 'Failed to generate video, please try again.',
        )
        setIsGenerating(false)
        return
      }
      const { data } = res
      if (data) {
        localStorage.setItem(
          'generateVideoTask',
          JSON.stringify({
            generateVideoTaskId: data,
          }),
        )
        loopTaskId(data)
      }
    } finally {
    }
  }
  const loopTaskId = (task_id: string) => {
    loopTimer = setInterval(async () => {
      try {
        const res = await getVideoResult(task_id)
        // console.log('查询视频', res)
        setIsGenerating(true)
        if (res.status !== 200) {
          toast.error(
            res.message || 'Failed to generate video, please try again.',
          )
          setIsGenerating(false)
          clearInterval(loopTimer)
          localStorage.removeItem('generateVideoTask')
          return
        }
        const { data }: any = res
        if (data.status === 'finished') {
          // console.log('查询结束')
          // data.workflow_id == 2 是 mochi
          setIsGenerating(false)
          clearInterval(loopTimer)
          setResult({
            url: data.result,
            workflow_id: data.workflow_id,
          })
          localStorage.removeItem('generateVideoTask')
        }
      } catch {
        // console.log('查询失败')
      }
    }, 10000)
  }
  const getVideoResult = async (task_id: string) => {
    const response = await getGenerateVideoResult(task_id)
    // console.log('loop resposnse', response)
    return response
  }
  function downloadVideo() {
    if (!result.url) return
    if (result.workflow_id === '1') {
      fetch(result.url)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'video.mp4'
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        })
        .catch((error) => console.error('download video error:', error))
      return
    }
    fetch(result.url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'image.webp'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      })
      .catch((error) => console.error('download video error:', error))
  }

  return (
    <div>
      <div className="grid w-full gap-4 py-4">
        {/* <Image
          alt="video"
          src="https://s3proxydc.akave.ai/prod-heurist/test-video/mochi-fp8-0xE54E6269f1c11307fb3414ca10d139FdF9CEbBfa-8776eb9e1d.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=CohcRQbZb7IaNI1tdfA1t9aEknK8J4%2F20241221%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241221T050402Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=6139fea3c42e66003acddf3b1b0cae5f14455403d117cf0e3012f685d8e53680"
          width={400}
          height={200}
        /> */}
        {/* <div>
          {videoSrc && (
            <VideoPlayer
              src={videoSrc}
              type="video/mp4"
              className="mx-auto max-w-3xl"
            />
          )}
        </div> */}
      </div>
      <Form {...form}>
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Prompt
                  <Tooltip content="Enter a description or a list of key words of the video you want to generate">
                    <Info className="ml-2 h-4 w-4 cursor-help" />
                  </Tooltip>
                </FormLabel>
                <FormControl>
                  <div>
                    <Textarea
                      placeholder="Prompt"
                      autoComplete="off"
                      rows={3}
                      {...field}
                    />
                    <div className="mt-2 text-right">
                      <a
                        href="https://ai-image-prompt-creator.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        Need inspiration? Use this prompt generator
                      </a>
                    </div>
                  </div>
                </FormControl>
                {showRecommend && (
                  <FormDescription>
                    Recommended key words: {modelInfo.recommend}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="workflow_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video Model</FormLabel>
                <FormControl>
                  <RadioGroup
                    defaultValue="1"
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={'1'} id="1" />
                      <Label htmlFor="1">Hunyuan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={'2'} id="2" />
                      <Label htmlFor="2">Mochi</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          /> */}

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <FormField
              control={form.control}
              name="num_iterations"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="flex items-center">
                    Sampling Steps ({field.value})
                    <Tooltip content="Recommended: 20-30. Higher values may produce better quality but take longer.">
                      <Info className="ml-2 h-4 w-4 cursor-help" />
                    </Tooltip>
                  </FormLabel>
                  <Input
                    className="hidden"
                    name="num_iterations"
                    value={field.value}
                    onChange={() => {}}
                  />
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      min={1}
                      max={100}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guidance_scale"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FormField
              control={form.control}
              name="width"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Width</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Width"
                      type="number"
                      disabled={isTextToVideo}
                      {...field}
                      onBlur={(e) => {
                        if (
                          Number(e.target.value) >
                          (modelInfo.defaults?.max_width || 1024)
                        ) {
                          field.onChange(modelInfo.defaults?.max_width || 1024)
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Height"
                      type="number"
                      {...field}
                      disabled={isTextToVideo}
                      onBlur={(e) => {
                        if (
                          Number(e.target.value) >
                          (modelInfo.defaults.max_height || 1024)
                        ) {
                          field.onChange(modelInfo.defaults.max_height || 1024)
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-4">
            <motion.button
              className="h-14 w-full overflow-hidden rounded-lg text-2xl font-semibold text-white shadow-lg"
              style={{
                background: 'linear-gradient(45deg, #00ff9d, #ffff00, #00ff9d)',
                backgroundSize: '200% 200%',
              }}
              animate={{
                backgroundPosition: isGenerating
                  ? ['0% 50%', '100% 50%', '0% 50%']
                  : ['0% 50%', '100% 50%'],
              }}
              transition={{
                duration: isGenerating ? 3 : 6,
                ease: 'linear',
                repeat: Infinity,
              }}
              onClick={onSubmit}
              disabled={isGenerating}
            >
              <motion.div
                animate={{ scale: isGenerating ? [1, 1.1, 1] : [1, 1.05, 1] }}
                transition={{
                  duration: isGenerating ? 0.5 : 2,
                  repeat: Infinity,
                }}
              >
                {isGenerating ? 'Generating...' : 'Generate Video'}
              </motion.div>
            </motion.button>
            {/* <div onClick={getVideoResult}>获取结果</div> */}
          </div>
          {loadingUpload && (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Upload to Gateway
            </div>
          )}
          {!!transactionId && (
            <div className="flex gap-2">
              <div className="flex-shrink-0 whitespace-nowrap">
                Transaction Details:{' '}
              </div>
              <Link
                className="line-clamp-3 text-muted-foreground transition-colors hover:text-primary"
                href={`https://mygateway.xyz/explorer/transactions/${transactionId}`}
                target="_blank"
              >
                {`https://mygateway.xyz/explorer/transactions/${transactionId}`}
              </Link>
            </div>
          )}
        </div>
      </Form>
      {result.url && (
        <motion.div
          className="mt-8 flex flex-col items-center space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {result.workflow_id === '1' ? (
            <video src={result.url} controls />
          ) : (
            <Image
              className=""
              src={result.url}
              alt="image result"
              width={420}
              height={240}
            />
          )}
          <Button onClick={downloadVideo}>Download</Button>
        </motion.div>
      )}
    </div>
  )
}
