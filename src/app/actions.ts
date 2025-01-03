'use server'

import Heurist, { ImageModel } from 'heurist'
import { Text2VideoTask } from 'heurist/workflow'

import { env } from '@/env.mjs'
import { Gateway, UserIdentifierType } from '@gateway-dao/sdk'

const heurist = new Heurist({
  apiKey: env.AUTH_KEY,
  workflowURL: 'https://sequencer-v2.heurist.xyz',
})

const gateway = new Gateway({
  apiKey: env.GATEWAY_API_KEY,
  token: env.GATEWAY_TOKEN,
  url: 'https://protocol.mygateway.xyz/graphql',
})

export async function generateImage(data: any) {
  try {
    const model_input: any = {
      prompt: data.prompt || '',
    }

    if (data.neg_prompt) {
      model_input.neg_prompt = data.neg_prompt
    }

    if (data.num_iterations) {
      model_input.num_iterations = Number(data.num_iterations)
    }

    if (data.guidance_scale) {
      model_input.guidance_scale = Number(data.guidance_scale)
    }
    if (data.width) {
      model_input.width = Number(data.width)
    }
    if (data.height) {
      model_input.height = Number(data.height)
    }
    if (data.seed) {
      let seed = parseInt(data.seed)
      if (seed > Number.MAX_SAFE_INTEGER) {
        seed = seed % Number.MAX_SAFE_INTEGER
      }
      model_input.seed = seed
    }

    const params = {
      model: data.model as ImageModel,
      ...model_input,
    }

    const response = await heurist.images.generate(params)

    return { status: 200, data: response }
  } catch (error: any) {
    console.log(error.message, 'generateImage error')
    return { status: 500, message: error.message }
  }
}
export async function generateVideo(data: any) {
  try {
    console.log('Creating Text2Video task...')
    const { prompt, steps, workflow_id } = data

    const text2VideoTask: any = new Text2VideoTask({
      workflow_id: workflow_id || '1',
      prompt:
        prompt ||
        'a rabbit moving quickly in a beautiful winter scenery nature trees sunset tracking camera',
      // width: 848,
      // height: 480,
      // length: 37,
      // steps: 30,
      // seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      // fps: 24,
      // quality: 80,
      timeout_seconds: 600,
    })

    console.log('Task created:', text2VideoTask)
    console.log('Executing workflow...')

    const response = await heurist.workflow.executeWorkflow(text2VideoTask)

    console.log('Generated video task_id:', response)
    return { status: 200, data: response }
  } catch (error: any) {
    console.log(error.message, 'generateImage error')
    return { status: 500, message: error.message }
  }
}
export async function getGenerateVideoResult(task_id: string) {
  try {
    console.log('taskid', task_id)

    const response = await heurist.workflow.queryTaskResult(task_id)
    return { status: 200, data: response }
  } catch (error: any) {
    return { status: 500, message: error.message }
  }
}

export async function issueToGateway(data: any, address: string) {
  try {
    const res = await fetch('https://protocol.mygateway.xyz/graphql', {
      method: 'POST',
      headers: {
        'X-Api-Key': env.GATEWAY_API_KEY,
        Authorization: `Bearer ${env.GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
        mutation createPDA {
          createPDA(
            input: {
              dataModelId: "ed6f1213-fe9f-4d5f-b239-7105fe2ab590"
              description: "A data model for iamge generation from Heurist."
              title: "Heurist AI Data Model"
              claim: {
                model_id: "${data.model}"
                prompt: "${data.prompt}"
                negative_prompt: "${data.neg_prompt || ''}"
                num_steps: ${data.num_inference_steps}
                guidance_scale: ${data.guidance_scale}
                seed: ${data.seed}
                image_url: "${data.url}"
              }
              owner: { type: EVM, value: "${address}" }
            }
          ) {
            id
            dataAsset {
              owner {
                id
                gatewayId
              }
              issuer {
                id
                gatewayId
              }
            }
            transactionId
          }
        }
        `,
        variables: {},
      }),
    })
      .then((res) => res.json())
      .catch((error) => {
        console.log(error, 'error')
      })

    return { status: 200, data: res.data.createPDA }
  } catch (error: any) {
    console.log(error, 'issueToGateway error') // Can log it for debugging
    return { status: 500, message: error.message }
  }
}

export async function getPDAs(address: string) {
  try {
    const pdas = await gateway.pda.getPDAs({
      filter: { owner: { type: UserIdentifierType.EVM, value: address } },
    })
    return { status: 200, data: pdas }
  } catch (error: any) {
    console.log(error, 'getPDAs error') // Can log it for debugging
    return { status: 500, message: error.message }
  }
}
