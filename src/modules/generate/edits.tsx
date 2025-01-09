'use client'
import { useEffect, useState } from 'react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import Image from 'next/image'
import { usePartnerFreeMint } from '@/hooks/usePartnerFreeMint'
import 'react-photo-view/dist/react-photo-view.css'
import { formatDistance } from 'date-fns'

const DB_NAME = 'ImageEditorDB'
const STORE_NAME = 'editedImages'
const DB_VERSION = 1

interface SavedImage {
    name: string
    width: number
    height: number
    create_at: string
    base64: string
}

interface ModelImages {
    name: string
    imgs: SavedImage[]
}

export default function Edits({ model }: { model: string }) {
    const { refreshPartnerNFTs } = usePartnerFreeMint()
    const [modelImages, setModelImages] = useState<SavedImage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const deleteImage = async (imageName: string) => {
        try {
            const db = await new Promise<IDBDatabase>((resolve, reject) => {
                const request = indexedDB.open(DB_NAME, DB_VERSION)
                request.onerror = () => reject(request.error)
                request.onsuccess = () => resolve(request.result)
            })

            const transaction = db.transaction(STORE_NAME, 'readwrite')
            const store = transaction.objectStore(STORE_NAME)
            
            const getRequest = store.get(model)
            
            getRequest.onsuccess = () => {
                const modelData = getRequest.result as ModelImages
                if (modelData && modelData.imgs) {
                    const updatedImages = modelData.imgs.filter(img => img.name !== imageName)
                    const updateData = {
                        name: model,
                        imgs: updatedImages
                    }
                    store.put(updateData)
                    setModelImages(updatedImages.sort(
                        (a, b) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime()
                    ))
                }
            }

            transaction.oncomplete = () => {
                db.close()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete image')
        }
    }


    useEffect(() => {
        refreshPartnerNFTs()
    }, [refreshPartnerNFTs])

    useEffect(() => {
        const fetchImagesFromIndexedDB = async () => {
            try {
                const db = await new Promise<IDBDatabase>((resolve, reject) => {
                    const request = indexedDB.open(DB_NAME, DB_VERSION)
                    
                    request.onerror = () => reject(request.error)
                    request.onsuccess = () => resolve(request.result)
                    
                    request.onupgradeneeded = (event) => {
                        const db = (event.target as IDBOpenDBRequest).result
                        if (!db.objectStoreNames.contains(STORE_NAME)) {
                            const store = db.createObjectStore(STORE_NAME, { keyPath: 'name' })
                            store.createIndex('create_at', 'create_at', { unique: false })
                        }
                    }
                })

                const transaction = db.transaction(STORE_NAME, 'readonly')
                const store = transaction.objectStore(STORE_NAME)
                const request = store.get(model)

                request.onsuccess = () => {
                    const modelData = request.result as ModelImages
                    if (modelData && modelData.imgs) {
                        const sortedImages = [...modelData.imgs].sort(
                            (a, b) => new Date(b.create_at).getTime() - new Date(a.create_at).getTime()
                        )
                        setModelImages(sortedImages)
                    }
                    setLoading(false)
                }

                request.onerror = () => {
                    setError('Failed to fetch images')
                    setLoading(false)
                }

                // Clean up
                transaction.oncomplete = () => {
                    db.close()
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
                setLoading(false)
            }
        }

        fetchImagesFromIndexedDB()
    }, [model])

    if (loading) {
        return <div className="py-4">Loading...</div>
    }

    if (error) {
        return <div className="py-4 text-red-500">Error: {error}</div>
    }

    if (!modelImages.length) {
        return <div className="py-4">No data</div>
    }

    return (
        <PhotoProvider>
            <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3">
                {modelImages.map((item, j) => (
                    <div
                        key={item.name}
                        className="group overflow-y-hidden relative flex cursor-pointer flex-col justify-between rounded-lg border"
                    >
                        <Image
                            className="h-[25rem] w-full rounded-lg object-cover object-center transition-opacity duration-image"
                            unoptimized
                            src={item.base64}
                            width={item.width}
                            height={item.height}
                            alt="img"
                        />
                        <div className="absolute h-full w-full bg-gradient-to-t from-zinc-950 via-zinc-900/50" />
                        <PhotoView src={item.base64}>
                            <div className="absolute p-2 bg-white top-4 right-4 rounded-full scale-[0.9] group-hover:scale-[1.4] transition">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#000000" viewBox="0 0 256 256">
                                    <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z" />
                                </svg>
                            </div>
                        </PhotoView>
                        <div className="flex flex-col absolute bottom-4 left-0 px-4 gap-4">
                            <div className="text-[13px] leading-[20px] text-[rgb(142,141,145)]">
                                {formatDistance(new Date(item.create_at), new Date(), {
                                    addSuffix: true,
                                })}
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteImage(item.name);
                            }}
                            className="absolute bottom-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </PhotoProvider>
    )
}